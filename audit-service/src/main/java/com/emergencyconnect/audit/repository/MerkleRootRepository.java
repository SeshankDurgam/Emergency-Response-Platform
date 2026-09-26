/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.repository;

import com.emergencyconnect.audit.model.MerkleRoot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MerkleRootRepository extends JpaRepository<MerkleRoot, UUID> {

    Page<MerkleRoot> findAllByOrderByCommittedAtDesc(Pageable pageable);

    Optional<MerkleRoot> findTopByOrderByCommittedAtDesc();
}
