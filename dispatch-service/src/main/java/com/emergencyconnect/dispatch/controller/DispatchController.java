/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.dispatch.controller;

import com.emergencyconnect.dispatch.model.Assignment;
import com.emergencyconnect.dispatch.model.AssignmentStatus;
import com.emergencyconnect.dispatch.service.DispatchService;
import com.emergencyconnect.dispatch.service.SmartDispatchEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dispatch")
@RequiredArgsConstructor
@Tag(name = "Dispatch", description = "Assign and track emergency units, plus SmartDispatchEngine AI recommendations")
@SecurityRequirement(name = "bearerAuth")
public class DispatchController {

    private final DispatchService dispatchService;
    private final SmartDispatchEngine smartDispatchEngine;

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('DISPATCHER','ADMIN')")
    @Operation(summary = "Manually assign a unit to an incident",
               description = "Creates an assignment record. Uses Redis distributed locks to prevent double-assignment. DISPATCHER only.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Unit assigned"),
        @ApiResponse(responseCode = "409", description = "Unit or incident is already locked by another dispatch")
    })
    public ResponseEntity<Assignment> assign(@RequestBody Map<String, String> body,
                                              Authentication auth) {
        UUID incidentId = UUID.fromString(body.get("incidentId"));
        UUID unitId = UUID.fromString(body.get("unitId"));
        UUID dispatcherId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(dispatchService.assignUnit(incidentId, unitId, dispatcherId));
    }

    @GetMapping("/assignments")
    @Operation(summary = "List all assignments", description = "Paginated list of all dispatch assignments.")
    @ApiResponse(responseCode = "200", description = "Assignments returned")
    public ResponseEntity<Page<Assignment>> listAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(dispatchService.listAssignments(PageRequest.of(page, size)));
    }

    @GetMapping("/assignments/{id}")
    @Operation(summary = "Get assignment by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Assignment found"),
        @ApiResponse(responseCode = "404", description = "Assignment not found")
    })
    public ResponseEntity<Assignment> getAssignment(@PathVariable UUID id) {
        return ResponseEntity.ok(dispatchService.getAssignment(id));
    }

    @PatchMapping("/assignments/{id}/status")
    @PreAuthorize("hasAnyRole('RESPONDER','OPERATOR','DISPATCHER')")
    @Operation(summary = "Update assignment status",
               description = "Moves an assignment through its lifecycle: EN_ROUTE, ON_SCENE, COMPLETED.")
    @ApiResponse(responseCode = "200", description = "Status updated")
    public ResponseEntity<Assignment> updateStatus(@PathVariable UUID id,
                                                    @RequestBody Map<String, String> body) {
        AssignmentStatus newStatus = AssignmentStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(dispatchService.updateStatus(id, newStatus));
    }

    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasRole('DISPATCHER')")
    @Operation(summary = "Cancel a dispatch assignment", description = "DISPATCHER only.")
    @ApiResponse(responseCode = "204", description = "Assignment cancelled")
    public ResponseEntity<Void> cancel(@PathVariable UUID id) {
        dispatchService.cancelAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/incidents/{incidentId}/assignments")
    @Operation(summary = "List assignments for an incident",
               description = "Returns all dispatch assignments linked to the given incident.")
    @ApiResponse(responseCode = "200", description = "Assignments returned")
    public ResponseEntity<Page<Assignment>> listByIncident(
            @PathVariable UUID incidentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(dispatchService.listByIncident(incidentId, PageRequest.of(page, size)));
    }

    @GetMapping("/recommendations/{incidentId}")
    @PreAuthorize("hasAnyRole('DISPATCHER','ADMIN','OPERATOR')")
    @Operation(summary = "Get SmartDispatchEngine recommendations",
               description = "Ranks available units using a Haversine geo-score weighted by severity, proximity and SLA. " +
                             "Returns the top-N recommendations with ETA. DISPATCHER only.")
    @ApiResponse(responseCode = "200", description = "Recommendations returned")
    public ResponseEntity<Map<String, Object>> getRecommendations(
            @PathVariable UUID incidentId,
            @Parameter(description = "Incident latitude") @RequestParam(required = false, defaultValue = "0") BigDecimal lat,
            @Parameter(description = "Incident longitude") @RequestParam(required = false, defaultValue = "0") BigDecimal lon,
            @Parameter(description = "Incident severity: CRITICAL, HIGH, MEDIUM, LOW") @RequestParam String severity,
            @Parameter(description = "UAE emirate") @RequestParam String emirate) {
        List<SmartDispatchEngine.UnitRecommendation> recs =
                smartDispatchEngine.recommend(lat, lon, severity, emirate, 5);
        return ResponseEntity.ok(Map.of("incidentId", incidentId, "recommendations", recs));
    }

    @PostMapping("/smart-assign/{incidentId}")
    @PreAuthorize("hasAnyRole('DISPATCHER','ADMIN')")
    @Operation(summary = "Auto-assign the best available unit",
               description = "Runs the SmartDispatchEngine and assigns the top-ranked unit automatically. DISPATCHER only.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Unit auto-assigned"),
        @ApiResponse(responseCode = "204", description = "No available units found")
    })
    public ResponseEntity<Assignment> smartAssign(
            @PathVariable UUID incidentId,
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lon,
            @RequestParam String severity,
            @RequestParam String emirate,
            Authentication auth) {
        List<SmartDispatchEngine.UnitRecommendation> recs =
                smartDispatchEngine.recommend(lat, lon, severity, emirate, 1);
        if (recs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        UUID unitId = recs.get(0).getUnit().getId();
        UUID dispatcherId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(dispatchService.assignUnit(incidentId, unitId, dispatcherId));
    }
}
