/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.repository;

import com.emergencyconnect.auth.model.IpWhitelist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IpWhitelistRepository extends JpaRepository<IpWhitelist, Long> {
    boolean existsByIpAddress(String ipAddress);
    Optional<IpWhitelist> findByIpAddress(String ipAddress);
}
