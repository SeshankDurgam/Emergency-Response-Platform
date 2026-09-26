/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.controller;

import com.emergencyconnect.incident.dto.*;
import com.emergencyconnect.incident.model.IncidentSeverity;
import com.emergencyconnect.incident.model.IncidentStatus;
import com.emergencyconnect.incident.model.IncidentStatusHistory;
import com.emergencyconnect.incident.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Incidents", description = "Create, query, update and cancel emergency incidents across all UAE emirates")
@SecurityRequirement(name = "bearerAuth")
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DISPATCHER','RESPONDER','OPERATOR','ADMIN')")
    @Operation(summary = "Report a new incident",
               description = "Creates a new emergency incident. Caller user-ID is stored as reporter. Roles: DISPATCHER, RESPONDER, OPERATOR, ADMIN.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Incident created"),
        @ApiResponse(responseCode = "400", description = "Validation error")
    })
    public ResponseEntity<IncidentResponse> create(@Valid @RequestBody CreateIncidentRequest req,
                                                   Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(incidentService.createIncident(req, userId));
    }

    @GetMapping
    @Operation(summary = "List incidents with optional filters",
               description = "Returns a paginated list filterable by status, emirate, and severity.")
    @ApiResponse(responseCode = "200", description = "Incident page returned")
    public ResponseEntity<Page<IncidentResponse>> list(
            @Parameter(description = "Filter by status") @RequestParam(required = false) IncidentStatus status,
            @Parameter(description = "Filter by emirate") @RequestParam(required = false) String emirate,
            @Parameter(description = "Filter by severity") @RequestParam(required = false) IncidentSeverity severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                incidentService.listIncidents(status, emirate, severity, PageRequest.of(page, size)));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active incidents",
               description = "Returns every non-resolved, non-cancelled incident. Result is Redis-cached.")
    @ApiResponse(responseCode = "200", description = "Active incidents returned")
    public ResponseEntity<List<IncidentResponse>> getActive() {
        return ResponseEntity.ok(incidentService.getActiveIncidents());
    }

    @GetMapping("/dashboard/summary")
    @Operation(summary = "Dashboard summary counts",
               description = "Per-severity and per-status counts for dashboard widgets.")
    @ApiResponse(responseCode = "200", description = "Summary returned")
    public ResponseEntity<DashboardSummaryDTO> getDashboard() {
        return ResponseEntity.ok(incidentService.getDashboardSummary());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get incident by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Incident found"),
        @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    public ResponseEntity<IncidentResponse> getById(
            @Parameter(description = "Incident UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(incidentService.getIncident(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DISPATCHER','RESPONDER','OPERATOR','ADMIN')")
    @Operation(summary = "Update incident status",
               description = "Transitions the incident to a new status. Valid transitions are enforced by the service layer.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status updated"),
        @ApiResponse(responseCode = "400", description = "Invalid status transition")
    })
    public ResponseEntity<IncidentResponse> updateStatus(@PathVariable UUID id,
                                                         @Valid @RequestBody UpdateStatusRequest req,
                                                         Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(incidentService.updateStatus(id, req, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DISPATCHER','ADMIN')")
    @Operation(summary = "Cancel an incident", description = "Marks the incident CANCELLED. Only DISPATCHER and ADMIN.")
    @ApiResponse(responseCode = "204", description = "Incident cancelled")
    public ResponseEntity<Void> cancel(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        incidentService.cancelIncident(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get incident status history",
               description = "Full audit trail of status transitions for an incident.")
    @ApiResponse(responseCode = "200", description = "History returned")
    public ResponseEntity<Page<IncidentStatusHistory>> getHistory(@PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(incidentService.getHistory(id, PageRequest.of(page, size)));
    }
}
