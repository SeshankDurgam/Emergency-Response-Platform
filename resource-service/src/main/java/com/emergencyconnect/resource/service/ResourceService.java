/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.resource.service;

import com.emergencyconnect.resource.model.*;
import com.emergencyconnect.resource.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final UnitRepository unitRepository;
    private final HospitalRepository hospitalRepository;
    private final MedicalResourceRepository medicalResourceRepository;
    private final ResourceReservationService reservationService;

    @Transactional(readOnly = true)
    public Page<EmergencyUnit> listUnits(UnitStatus status, String emirate, UnitType type, Pageable pageable) {
        String validEmirate = (emirate != null && !emirate.trim().isEmpty()) ? emirate : null;

        if (status != null && validEmirate != null && type != null) {
            return unitRepository.findByStatusAndEmirateAndType(status, validEmirate, type, pageable);
        }
        if (status != null && validEmirate != null) {
            return unitRepository.findByStatusAndEmirate(status, validEmirate, pageable);
        }
        if (status != null) {
            return unitRepository.findByStatus(status, pageable);
        }
        if (validEmirate != null) {
            return unitRepository.findByEmirate(validEmirate, pageable);
        }
        return unitRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "resources", key = "'unit:' + #id")
    public EmergencyUnit getUnit(UUID id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found: " + id));
    }

    @Transactional
    @CacheEvict(value = "resources", allEntries = true)
    public EmergencyUnit updateUnitStatus(UUID id, UnitStatus newStatus) {
        EmergencyUnit unit = unitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found: " + id));
        unit.setStatus(newStatus);
        unit.setLastUpdated(Instant.now());
        return unitRepository.save(unit);
    }

    @Transactional(readOnly = true)
    public Page<Hospital> listHospitals(String emirate, Pageable pageable) {
        if (emirate != null && !emirate.trim().isEmpty()) {
            return hospitalRepository.findByEmirate(emirate, pageable);
        }
        return hospitalRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Hospital getHospital(UUID id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found: " + id));
    }

    @Transactional
    @CacheEvict(value = "resources", allEntries = true)
    public Hospital updateHospitalCapacity(UUID id, int availableBeds, int icuBedsAvailable) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found: " + id));
        hospital.setAvailableBeds(availableBeds);
        hospital.setIcuBedsAvailable(icuBedsAvailable);
        hospital.setLastUpdated(Instant.now());
        return hospitalRepository.save(hospital);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "resources", key = "'available-list:' + #emirate")
    public List<EmergencyUnit> listAvailableUnitsList(String emirate) {
        if (emirate != null) {
            return unitRepository.findByStatusAndEmirate(UnitStatus.AVAILABLE, emirate);
        }
        return unitRepository.findByStatus(UnitStatus.AVAILABLE, Pageable.unpaged()).getContent();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "resources", key = "'availability:' + #emirate")
    public long countAvailableUnits(String emirate) {
        if (emirate != null) {
            return unitRepository.findByStatusAndEmirate(UnitStatus.AVAILABLE, emirate).size();
        }
        return unitRepository.findByStatus(UnitStatus.AVAILABLE, Pageable.unpaged()).getTotalElements();
    }

    @Transactional(readOnly = true)
    public Page<MedicalResource> listMedicalResources(UUID hospitalId, Pageable pageable) {
        if (hospitalId != null) {
            return medicalResourceRepository.findByHospitalId(hospitalId, pageable);
        }
        return medicalResourceRepository.findAll(pageable);
    }


    @Transactional
    @CacheEvict(value = "resources", allEntries = true)
    public EmergencyUnit createUnit(EmergencyUnit unit) {
        unit.setLastUpdated(java.time.Instant.now());
        return unitRepository.save(unit);
    }

    @Transactional
    @CacheEvict(value = "resources", allEntries = true)
    public void deleteUnit(UUID id) {
        if (!unitRepository.existsById(id)) {
            throw new IllegalArgumentException("Unit not found: " + id);
        }
        unitRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "resources", allEntries = true)
    public Hospital createHospital(Hospital hospital) {
        hospital.setLastUpdated(java.time.Instant.now());
        return hospitalRepository.save(hospital);
    }

    @Transactional
    @CacheEvict(value = "resources", allEntries = true)
    public void deleteHospital(UUID id) {
        if (!hospitalRepository.existsById(id)) {
            throw new IllegalArgumentException("Hospital not found: " + id);
        }
        hospitalRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "resources", allEntries = true)
    public MedicalResource createMedicalResource(MedicalResource resource) {
        resource.setLastUpdated(java.time.Instant.now());
        return medicalResourceRepository.save(resource);
    }

    @Transactional
    @CacheEvict(value = "resources", allEntries = true)
    public MedicalResource reserveMedicalResource(UUID resourceId, UUID incidentId) {
        return reservationService.reserveResource(resourceId, incidentId);
    }

    @Transactional
    @CacheEvict(value = "resources", allEntries = true)
    public MedicalResource releaseMedicalResource(UUID resourceId) {
        return reservationService.releaseResource(resourceId);
    }
}
