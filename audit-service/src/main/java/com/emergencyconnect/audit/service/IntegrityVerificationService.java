/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.service;

import com.emergencyconnect.audit.dto.ChainVerificationResult;
import com.emergencyconnect.audit.dto.EntryVerificationResult;
import com.emergencyconnect.audit.dto.MerkleCommitResult;
import com.emergencyconnect.audit.model.AuditLog;
import com.emergencyconnect.audit.model.MerkleRoot;
import com.emergencyconnect.audit.repository.AuditLogRepository;
import com.emergencyconnect.audit.repository.MerkleRootRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntegrityVerificationService {

    private final AuditLogRepository auditLogRepository;
    private final MerkleRootRepository merkleRootRepository;
    private final ChainHashService chainHashService;
    private final MerkleTreeService merkleTreeService;

    @Transactional(readOnly = true)
    public EntryVerificationResult verifyEntry(UUID id) {
        AuditLog log = auditLogRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Audit entry not found: " + id));

        if (log.getEntryHash() == null) {
            return EntryVerificationResult.builder().entryId(id).verified(false).storedHash(null).computedHash(null).previousHash(log.getPreviousHash()).failureReason("Entry predates hash chain — no hash stored").build();
        }

        String computed = chainHashService.computeEntryHash(log);
        boolean match = computed.equals(log.getEntryHash());

        return EntryVerificationResult.builder().entryId(id).verified(match).storedHash(log.getEntryHash()).computedHash(computed).previousHash(log.getPreviousHash()).failureReason(match ? null : "Hash mismatch — entry may have been tampered with").build();
    }

    @Transactional(readOnly = true)
    public ChainVerificationResult verifyChain(int limit) {
        List<AuditLog> entries = auditLogRepository.findAllByOrderByOccurredAtAsc(PageRequest.of(0, limit)).getContent();

        List<EntryVerificationResult> results = new ArrayList<>();
        int tamperedCount = 0;
        int missingCount = 0;
        String firstTamperedId = null;
        String expectedPrevHash = ChainHashService.GENESIS_HASH;

        for (AuditLog entry : entries) {
            if (entry.getEntryHash() == null) {
                missingCount++;
                results.add(EntryVerificationResult.builder().entryId(entry.getId()).verified(false).storedHash(null).computedHash(null).previousHash(entry.getPreviousHash()).failureReason("No hash stored — entry predates hash chain").build());
                continue;
            }

            String computed = chainHashService.computeEntryHash(entry);
            boolean hashMatch = computed.equals(entry.getEntryHash());

            boolean chainLinkMatch = true;
            if (entry.getPreviousHash() != null && !expectedPrevHash.isEmpty()) {
                chainLinkMatch = expectedPrevHash.equals(entry.getPreviousHash()) || expectedPrevHash.equals(ChainHashService.GENESIS_HASH);
            }

            boolean ok = hashMatch && chainLinkMatch;
            if (!ok) {
                tamperedCount++;
                if (firstTamperedId == null) {
                    firstTamperedId = entry.getId().toString();
                }
            }

            results.add(EntryVerificationResult.builder().entryId(entry.getId()).verified(ok).storedHash(entry.getEntryHash()).computedHash(computed).previousHash(entry.getPreviousHash()).failureReason(ok ? null : (!hashMatch ? "Hash mismatch" : "Chain link broken")).build());

            expectedPrevHash = entry.getEntryHash();
        }

        return ChainVerificationResult.builder().chainIntact(tamperedCount == 0 && missingCount == 0).totalChecked(entries.size()).tampered(tamperedCount).missing(missingCount).firstTamperedId(firstTamperedId).entries(results).build();
    }

    @Transactional
    public MerkleCommitResult commitMerkleRoot(int limit) {
        List<AuditLog> entries = auditLogRepository.findAllByOrderByOccurredAtAsc(PageRequest.of(0, limit)).getContent();

        if (entries.isEmpty()) {
            throw new IllegalStateException("No audit entries to commit");
        }

        List<String> hashes = new ArrayList<>();
        for (AuditLog entry : entries) {
            String h = entry.getEntryHash() != null ? entry.getEntryHash() : chainHashService.computeEntryHash(entry);
            hashes.add(h);
        }

        MerkleTreeService.MerkleResult tree = merkleTreeService.buildTree(hashes);

        MerkleRoot root = MerkleRoot.builder().batchStartId(entries.get(0).getId()).batchEndId(entries.get(entries.size() - 1).getId()).entryCount(entries.size()).rootHash(tree.rootHash).committedAt(Instant.now()).build();
        root = merkleRootRepository.save(root);

        log.info("Merkle root committed: {} entries, root={}", entries.size(), tree.rootHash);

        return MerkleCommitResult.builder().merkleRootId(root.getId()).rootHash(tree.rootHash).entryCount(tree.leafCount).treeDepth(tree.layers.size()).committedAt(root.getCommittedAt()).batchStartId(root.getBatchStartId()).batchEndId(root.getBatchEndId()).build();
    }
}
