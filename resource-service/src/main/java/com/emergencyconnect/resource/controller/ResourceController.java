/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.resource.controller;

import com.emergencyconnect.resource.model.*;
import com.emergencyconnect.resource.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Manage emergency units, hospitals and medical resources across UAE emirates")
@SecurityRequirement(name = "bearerAuth")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping("/units")
    @Operation(summary = "List emergency units",
               description = "Paginated list of all emergency units. Filter by status, emirate or type.")
    @ApiResponse(responseCode = "200", description = "Units returned")
    public ResponseEntity<Page<EmergencyUnit>> listUnits(
            @Parameter(description = "Filter by status") @RequestParam(required = false) UnitStatus status,
            @Parameter(description = "Filter by emirate") @RequestParam(required = false) String emirate,
            @Parameter(description = "Filter by type") @RequestParam(required = false) UnitType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(resourceService.listUnits(status, emirate, type, PageRequest.of(page, size)));
    }

    @GetMapping("/units/available")
    @Operation(summary = "List available units",
               description = "Returns all AVAILABLE units for the SmartDispatchEngine. Optionally scoped to an emirate.")
    @ApiResponse(responseCode = "200", description = "Available units returned")
    public ResponseEntity<List<EmergencyUnit>> listAvailableUnits(
            @Parameter(description = "Emirate to scope the search") @RequestParam(required = false) String emirate) {
        return ResponseEntity.ok(resourceService.listAvailableUnitsList(emirate));
    }

    @GetMapping("/units/{id}")
    @Operation(summary = "Get emergency unit by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Unit found"),
        @ApiResponse(responseCode = "404", description = "Unit not found")
    })
    public ResponseEntity<EmergencyUnit> getUnit(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getUnit(id));
    }

    @PutMapping("/units/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','HOSPITAL_ADMIN','RESPONDER','OPERATOR')")
    @Operation(summary = "Update unit operational status",
               description = "Sets a unit to AVAILABLE, DISPATCHED, BUSY or MAINTENANCE. Clears the resource cache.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status updated"),
        @ApiResponse(responseCode = "400", description = "Invalid status value")
    })
    public ResponseEntity<EmergencyUnit> updateUnitStatus(@PathVariable UUID id,
                                                           @RequestBody Map<String, String> body) {
        UnitStatus newStatus = UnitStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(resourceService.updateUnitStatus(id, newStatus));
    }

    @PostMapping("/units")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new emergency unit",
               description = "ADMIN only. Registers a new ambulance, fire truck or police unit in the system.")
    @ApiResponse(responseCode = "201", description = "Unit created")
    public ResponseEntity<EmergencyUnit> createUnit(@RequestBody EmergencyUnit unit) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createUnit(unit));
    }

    @DeleteMapping("/units/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an emergency unit", description = "ADMIN only. Permanently removes a unit from the system.")
    @ApiResponse(responseCode = "204", description = "Unit deleted")
    public ResponseEntity<Void> deleteUnit(@PathVariable UUID id) {
        resourceService.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/hospitals")
    @Operation(summary = "List hospitals",
               description = "Paginated list of all registered hospitals. Optionally filter by emirate.")
    @ApiResponse(responseCode = "200", description = "Hospitals returned")
    public ResponseEntity<Page<Hospital>> listHospitals(
            @RequestParam(required = false) String emirate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(resourceService.listHospitals(emirate, PageRequest.of(page, size)));
    }

    @GetMapping("/hospitals/{id}")
    @Operation(summary = "Get hospital by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Hospital found"),
        @ApiResponse(responseCode = "404", description = "Hospital not found")
    })
    public ResponseEntity<Hospital> getHospital(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getHospital(id));
    }

    @PostMapping("/hospitals")
    @PreAuthorize("hasAnyRole('ADMIN','HOSPITAL_ADMIN')")
    @Operation(summary = "Create a new hospital",
               description = "ADMIN or HOSPITAL_ADMIN only. Registers a new hospital with bed counts and GPS location.")
    @ApiResponse(responseCode = "201", description = "Hospital created")
    public ResponseEntity<Hospital> createHospital(@RequestBody Hospital hospital) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createHospital(hospital));
    }

    @DeleteMapping("/hospitals/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a hospital", description = "ADMIN only. Permanently removes a hospital record.")
    @ApiResponse(responseCode = "204", description = "Hospital deleted")
    public ResponseEntity<Void> deleteHospital(@PathVariable UUID id) {
        resourceService.deleteHospital(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/hospitals/{id}/capacity")
    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','ADMIN')")
    @Operation(summary = "Update hospital bed capacity",
               description = "Sets the current available general and ICU bed counts. HOSPITAL_ADMIN or ADMIN.")
    @ApiResponse(responseCode = "200", description = "Capacity updated")
    public ResponseEntity<Hospital> updateCapacity(@PathVariable UUID id,
                                                    @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(resourceService.updateHospitalCapacity(
                id, body.get("availableBeds"), body.get("icuBedsAvailable")));
    }

    @GetMapping("/availability")
    @Operation(summary = "Count available units",
               description = "Fast counter of AVAILABLE units used by the dispatch dashboard.")
    @ApiResponse(responseCode = "200", description = "Count returned")
    public ResponseEntity<Map<String, Long>> getAvailability(
            @RequestParam(required = false) String emirate) {
        return ResponseEntity.ok(Map.of("availableUnits", resourceService.countAvailableUnits(emirate)));
    }

    @GetMapping("/medical")
    @Operation(summary = "List medical resources",
               description = "Paginated list of medical supplies and equipment. Optionally scoped to a hospital.")
    @ApiResponse(responseCode = "200", description = "Medical resources returned")
    public ResponseEntity<Page<MedicalResource>> listMedical(
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(resourceService.listMedicalResources(hospitalId, PageRequest.of(page, size)));
    }

    @PostMapping("/medical")
    @PreAuthorize("hasAnyRole('ADMIN','HOSPITAL_ADMIN')")
    @Operation(summary = "Add a medical resource",
               description = "ADMIN or HOSPITAL_ADMIN only. Registers new medical equipment or supplies at a hospital.")
    @ApiResponse(responseCode = "201", description = "Medical resource created")
    public ResponseEntity<MedicalResource> createMedicalResource(@RequestBody MedicalResource resource) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createMedicalResource(resource));
    }

    @PostMapping("/medical/{id}/reserve")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER')")
    @Operation(summary = "Reserve a medical resource",
               description = "Atomically reserves a medical resource for an incident using a Redis distributed lock. DISPATCHER only.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Resource reserved"),
        @ApiResponse(responseCode = "409", description = "Resource already reserved or lock could not be acquired")
    })
    public ResponseEntity<MedicalResource> reserve(@PathVariable UUID id,
                                                    @RequestBody Map<String, String> body) {
        UUID incidentId = UUID.fromString(body.get("incidentId"));
        return ResponseEntity.ok(resourceService.reserveMedicalResource(id, incidentId));
    }

    @PostMapping("/medical/{id}/release")
    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','RESPONDER','OPERATOR')")
    @Operation(summary = "Release a reserved medical resource",
               description = "Returns the resource to available status.")
    @ApiResponse(responseCode = "200", description = "Resource released")
    public ResponseEntity<MedicalResource> release(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.releaseMedicalResource(id));
    }
}
