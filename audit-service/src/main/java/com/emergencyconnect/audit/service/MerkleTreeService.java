/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.audit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MerkleTreeService {

    private final ChainHashService hashService;

    public static class MerkleResult {
        public final String rootHash;
        public final List<List<String>> layers;
        public final int leafCount;

        public MerkleResult(String rootHash, List<List<String>> layers, int leafCount) {
            this.rootHash = rootHash;
            this.layers = layers;
            this.leafCount = leafCount;
        }
    }

    public MerkleResult buildTree(List<String> leafHashes) {
        if (leafHashes == null || leafHashes.isEmpty()) {
            throw new IllegalArgumentException("Cannot build Merkle tree from empty leaf set");
        }

        List<List<String>> layers = new ArrayList<>();
        List<String> currentLayer = new ArrayList<>(leafHashes);
        layers.add(new ArrayList<>(currentLayer));

        while (currentLayer.size() > 1) {
            if (currentLayer.size() % 2 != 0) {
                currentLayer.add(currentLayer.get(currentLayer.size() - 1));
            }
            List<String> nextLayer = new ArrayList<>();
            for (int i = 0; i < currentLayer.size(); i += 2) {
                String parent = hashService.computePairHash(currentLayer.get(i), currentLayer.get(i + 1));
                nextLayer.add(parent);
            }
            currentLayer = nextLayer;
            layers.add(new ArrayList<>(currentLayer));
        }

        String rootHash = currentLayer.get(0);
        log.debug("Built Merkle tree: {} leaves, {} layers, root={}", leafHashes.size(), layers.size(), rootHash);
        return new MerkleResult(rootHash, layers, leafHashes.size());
    }

    public List<String> generateProof(List<String> leafHashes, int leafIndex) {
        if (leafIndex < 0 || leafIndex >= leafHashes.size()) {
            throw new IndexOutOfBoundsException("Leaf index out of range: " + leafIndex);
        }

        List<String> proof = new ArrayList<>();
        List<String> currentLayer = new ArrayList<>(leafHashes);
        int index = leafIndex;

        while (currentLayer.size() > 1) {
            if (currentLayer.size() % 2 != 0) {
                currentLayer.add(currentLayer.get(currentLayer.size() - 1));
            }
            int siblingIndex = (index % 2 == 0) ? index + 1 : index - 1;
            proof.add(currentLayer.get(siblingIndex));

            List<String> nextLayer = new ArrayList<>();
            for (int i = 0; i < currentLayer.size(); i += 2) {
                nextLayer.add(hashService.computePairHash(currentLayer.get(i), currentLayer.get(i + 1)));
            }
            currentLayer = nextLayer;
            index = index / 2;
        }
        return proof;
    }

    public boolean verifyProof(String leafHash, List<String> proof, String rootHash, int leafIndex) {
        String current = leafHash;
        int index = leafIndex;
        for (String sibling : proof) {
            if (index % 2 == 0) {
                current = hashService.computePairHash(current, sibling);
            } else {
                current = hashService.computePairHash(sibling, current);
            }
            index = index / 2;
        }
        return current.equals(rootHash);
    }
}
