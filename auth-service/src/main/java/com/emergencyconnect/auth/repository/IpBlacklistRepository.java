/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.repository;

import com.emergencyconnect.auth.model.IpBlacklist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IpBlacklistRepository extends JpaRepository<IpBlacklist, Long> {
    boolean existsByIpAddress(String ipAddress);
    Optional<IpBlacklist> findByIpAddress(String ipAddress);
    Page<IpBlacklist> findAll(Pageable pageable);
}
