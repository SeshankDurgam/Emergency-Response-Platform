/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.resource.repository;

import com.emergencyconnect.resource.model.EmergencyUnit;
import com.emergencyconnect.resource.model.UnitStatus;
import com.emergencyconnect.resource.model.UnitType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UnitRepository extends JpaRepository<EmergencyUnit, UUID> {
    Page<EmergencyUnit> findByStatus(UnitStatus status, Pageable pageable);
    Page<EmergencyUnit> findByEmirate(String emirate, Pageable pageable);
    Page<EmergencyUnit> findByStatusAndEmirate(UnitStatus status, String emirate, Pageable pageable);
    Page<EmergencyUnit> findByStatusAndEmirateAndType(UnitStatus status, String emirate, UnitType type, Pageable pageable);
    List<EmergencyUnit> findByStatusAndEmirate(UnitStatus status, String emirate);
}
