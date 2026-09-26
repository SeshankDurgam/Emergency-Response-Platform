/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.controller;

import com.emergencyconnect.auth.dto.BlacklistIpRequest;
import com.emergencyconnect.auth.dto.UserDTO;
import com.emergencyconnect.auth.dto.WhitelistIpRequest;
import com.emergencyconnect.auth.model.IpBlacklist;
import com.emergencyconnect.auth.model.IpWhitelist;
import com.emergencyconnect.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Admin", description = "User management and IP security operations (ADMIN only)")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final AuthService authService;

    @GetMapping("/api/v1/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all registered users", description = "Returns paginated list of all users. ADMIN only.")
    @ApiResponse(responseCode = "200", description = "Users returned")
    public ResponseEntity<Page<UserDTO>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(authService.listUsers(PageRequest.of(page, size)));
    }

    @PutMapping("/api/v1/users/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate a user account", description = "Enables a previously disabled user. ADMIN only.")
    @ApiResponse(responseCode = "200", description = "User activated")
    public ResponseEntity<Void> activateUser(@PathVariable UUID id) {
        authService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/api/v1/users/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate a user account", description = "Disables a user's access. ADMIN only.")
    @ApiResponse(responseCode = "200", description = "User deactivated")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        authService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/v1/security/blacklist/ip")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add IP to blacklist", description = "Blocks all requests from the specified IP. ADMIN only.")
    @ApiResponse(responseCode = "200", description = "IP blacklisted")
    public ResponseEntity<Void> blacklistIp(@Valid @RequestBody BlacklistIpRequest req) {
        authService.blacklistIp(req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/v1/security/blacklist/ip/{ip}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove IP from blacklist")
    @ApiResponse(responseCode = "204", description = "IP removed")
    public ResponseEntity<Void> removeFromBlacklist(@PathVariable String ip) {
        authService.unblacklistIp(ip);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/security/blacklist/ips")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List blacklisted IPs")
    @ApiResponse(responseCode = "200", description = "Blacklist returned")
    public ResponseEntity<Page<IpBlacklist>> listBlacklist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(authService.listBlacklist(PageRequest.of(page, size)));
    }

    @PostMapping("/api/v1/security/whitelist/ip")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add IP to whitelist", description = "Marks an IP as trusted. Used to allow IPs that bypass standard restrictions. ADMIN only.")
    @ApiResponse(responseCode = "200", description = "IP whitelisted")
    public ResponseEntity<Void> whitelistIp(@Valid @RequestBody WhitelistIpRequest req,
                                             Authentication auth) {
        authService.whitelistIp(req.getIpAddress(), req.getDescription(), auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/v1/security/whitelist/ip/{ip}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove IP from whitelist")
    @ApiResponse(responseCode = "204", description = "IP removed from whitelist")
    public ResponseEntity<Void> removeFromWhitelist(@PathVariable String ip) {
        authService.removeFromWhitelist(ip);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/security/whitelist/ips")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List whitelisted IPs")
    @ApiResponse(responseCode = "200", description = "Whitelist returned")
    public ResponseEntity<Page<IpWhitelist>> listWhitelist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(authService.listWhitelist(PageRequest.of(page, size)));
    }
}
