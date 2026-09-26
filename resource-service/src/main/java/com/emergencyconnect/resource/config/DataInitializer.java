/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.resource.config;

import com.emergencyconnect.resource.model.*;
import com.emergencyconnect.resource.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UnitRepository unitRepository;
    private final HospitalRepository hospitalRepository;
    private final MedicalResourceRepository medicalResourceRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (unitRepository.count() > 0) {
            log.info("Seed data already present, skipping initialization");
            return;
        }

        log.info("Seeding UAE emergency resource data...");
        seedHospitals();
        seedUnits();
        log.info("Seed data loaded successfully");
    }

    private void seedHospitals() {
        Hospital rashid = hospitalRepository.save(Hospital.builder()
                .name("Rashid Hospital")
                .emirate("Dubai")
                .latitude(new BigDecimal("25.2333"))
                .longitude(new BigDecimal("55.3167"))
                .totalBeds(750)
                .availableBeds(320)
                .icuBedsTotal(80)
                .icuBedsAvailable(30)
                .acceptsTrauma(true)
                .build());

        Hospital dubaiHospital = hospitalRepository.save(Hospital.builder()
                .name("Dubai Hospital")
                .emirate("Dubai")
                .latitude(new BigDecimal("25.2854"))
                .longitude(new BigDecimal("55.3271"))
                .totalBeds(600)
                .availableBeds(210)
                .icuBedsTotal(60)
                .icuBedsAvailable(18)
                .acceptsTrauma(true)
                .build());

        Hospital tawam = hospitalRepository.save(Hospital.builder()
                .name("Tawam Hospital")
                .emirate("Abu Dhabi")
                .latitude(new BigDecimal("24.2154"))
                .longitude(new BigDecimal("55.7461"))
                .totalBeds(480)
                .availableBeds(160)
                .icuBedsTotal(50)
                .icuBedsAvailable(20)
                .acceptsTrauma(true)
                .build());

        Hospital skmc = hospitalRepository.save(Hospital.builder()
                .name("Sheikh Khalifa Medical City")
                .emirate("Abu Dhabi")
                .latitude(new BigDecimal("24.4539"))
                .longitude(new BigDecimal("54.3773"))
                .totalBeds(700)
                .availableBeds(280)
                .icuBedsTotal(70)
                .icuBedsAvailable(25)
                .acceptsTrauma(true)
                .build());

        Hospital kuwaiti = hospitalRepository.save(Hospital.builder()
                .name("Kuwaiti Hospital Sharjah")
                .emirate("Sharjah")
                .latitude(new BigDecimal("25.3350"))
                .longitude(new BigDecimal("55.4200"))
                .totalBeds(350)
                .availableBeds(120)
                .icuBedsTotal(35)
                .icuBedsAvailable(12)
                .acceptsTrauma(false)
                .build());

        seedMedicalResources(rashid, 30, 15);
        seedMedicalResources(dubaiHospital, 25, 10);
        seedMedicalResources(tawam, 20, 8);
        seedMedicalResources(skmc, 28, 12);
        seedMedicalResources(kuwaiti, 15, 6);
    }

    private void seedMedicalResources(Hospital hospital, int ventilators, int defibCount) {
        medicalResourceRepository.save(MedicalResource.builder()
                .name("Mechanical Ventilator")
                .type("VENTILATOR")
                .hospital(hospital)
                .totalQuantity(ventilators)
                .availableQuantity(ventilators)
                .build());

        medicalResourceRepository.save(MedicalResource.builder()
                .name("Defibrillator")
                .type("DEFIBRILLATOR")
                .hospital(hospital)
                .totalQuantity(defibCount)
                .availableQuantity(defibCount)
                .build());

        medicalResourceRepository.save(MedicalResource.builder()
                .name("Portable Oxygen Unit")
                .type("OXYGEN")
                .hospital(hospital)
                .totalQuantity(40)
                .availableQuantity(40)
                .build());
    }

    private void seedUnits() {
        Object[][] dubaiUnits = {
            {"DXB-AMB-001", UnitType.AMBULANCE,  "25.2048", "55.2708", "Dubai Downtown Station"},
            {"DXB-AMB-002", UnitType.AMBULANCE,  "25.1972", "55.2744", "Dubai Marina Station"},
            {"DXB-AMB-003", UnitType.AMBULANCE,  "25.2631", "55.3001", "Deira Station"},
            {"DXB-AMB-004", UnitType.AMBULANCE,  "25.1174", "55.2000", "Jebel Ali Station"},
            {"DXB-POL-001", UnitType.POLICE, "25.2048", "55.2708", "Dubai Downtown Station"},
            {"DXB-POL-002", UnitType.POLICE, "25.2631", "55.3001", "Deira Station"},
            {"DXB-POL-003", UnitType.POLICE, "25.0657", "55.1713", "Al Quoz Station"},
            {"DXB-FIRE-001", UnitType.FIRE_TRUCK, "25.2048", "55.2708", "Dubai Main Fire Station"},
            {"DXB-FIRE-002", UnitType.FIRE_TRUCK, "25.2631", "55.3001", "Deira Fire Station"},
            {"DXB-HELI-001", UnitType.RESCUE_HELICOPTER, "25.2532", "55.3657", "Dubai Air Wing"},
        };

        Object[][] abuDhabiUnits = {
            {"AUH-AMB-001", UnitType.AMBULANCE,  "24.4539", "54.3773", "Abu Dhabi Central Station"},
            {"AUH-AMB-002", UnitType.AMBULANCE,  "24.4667", "54.3667", "Corniche Station"},
            {"AUH-AMB-003", UnitType.AMBULANCE,  "24.2154", "55.7461", "Al Ain Station"},
            {"AUH-POL-001", UnitType.POLICE, "24.4539", "54.3773", "Abu Dhabi HQ"},
            {"AUH-POL-002", UnitType.POLICE, "24.2154", "55.7461", "Al Ain HQ"},
            {"AUH-FIRE-001", UnitType.FIRE_TRUCK, "24.4539", "54.3773", "Abu Dhabi Fire Station"},
            {"AUH-HELI-001", UnitType.RESCUE_HELICOPTER, "24.4330", "54.6511", "Abu Dhabi Air Wing"},
        };

        Object[][] sharjahUnits = {
            {"SHJ-AMB-001", UnitType.AMBULANCE,  "25.3350", "55.4200", "Sharjah Central Station"},
            {"SHJ-AMB-002", UnitType.AMBULANCE,  "25.3573", "55.3910", "Al Nahda Station"},
            {"SHJ-POL-001", UnitType.POLICE, "25.3350", "55.4200", "Sharjah Police HQ"},
            {"SHJ-FIRE-001", UnitType.FIRE_TRUCK, "25.3350", "55.4200", "Sharjah Fire Station"},
        };

        saveUnits(dubaiUnits, "Dubai");
        saveUnits(abuDhabiUnits, "Abu Dhabi");
        saveUnits(sharjahUnits, "Sharjah");
    }

    private void saveUnits(Object[][] data, String emirate) {
        for (Object[] row : data) {
            unitRepository.save(EmergencyUnit.builder()
                    .unitCode((String) row[0])
                    .type((UnitType) row[1])
                    .currentLatitude(new BigDecimal((String) row[2]))
                    .currentLongitude(new BigDecimal((String) row[3]))
                    .homeStation((String) row[4])
                    .emirate(emirate)
                    .status(UnitStatus.AVAILABLE)
                    .crewCount(2)
                    .build());
        }
    }
}
