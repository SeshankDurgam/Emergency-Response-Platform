/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.incident.dto;

import com.emergencyconnect.incident.model.IncidentSeverity;
import com.emergencyconnect.incident.model.IncidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateIncidentRequest {

    @NotBlank
    @Pattern(regexp = "^[^/\\\\<>:.]*$",
             message = "Title must not contain path-separator or shell metacharacters")
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private IncidentType type;

    @NotNull
    private IncidentSeverity severity;

    private BigDecimal locationLatitude;
    private BigDecimal locationLongitude;

    @Pattern(regexp = "^[^/\\\\<>]*$",
             message = "Location address must not contain path-separator characters")
    private String locationAddress;

    @NotBlank
    @Pattern(regexp = "^[^/\\\\<>:.]*$",
             message = "Emirate must not contain path-separator characters")
    private String emirate;
}
