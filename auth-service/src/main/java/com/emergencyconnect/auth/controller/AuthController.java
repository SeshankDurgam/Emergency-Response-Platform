/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.controller;

import com.emergencyconnect.auth.dto.*;
import com.emergencyconnect.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, registration, email MFA and token refresh endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new operator",
               description = "Creates a new user account. Roles: DISPATCHER, RESPONDER, HOSPITAL_ADMIN, OPERATOR, ADMIN.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "User registered"),
        @ApiResponse(responseCode = "400", description = "Validation error or username/email already taken")
    })
    public ResponseEntity<UserDTO> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate an operator",
               description = "Validates credentials and returns a JWT. If the account is a DISPATCHER or ADMIN with " +
                             "MFA enabled, mfaRequired=true is returned, an OTP is sent to the user's email, and the " +
                             "token is limited until verified via /mfa/verify.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req,
                                              HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(req, getClientIp(httpRequest)));
    }

    @PostMapping("/mfa/send-code")
    @Operation(summary = "Resend MFA email OTP",
               description = "Generates a new 6-digit OTP and emails it to the user's registered address. " +
                             "Use when the user did not receive the code sent automatically at login.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Code sent, masked email returned"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<Map<String, String>> sendMfaCode(
            @Parameter(description = "UUID of the user") @RequestParam UUID userId) {
        String maskedEmail = authService.sendMfaCode(userId);
        return ResponseEntity.ok(Map.of("maskedEmail", maskedEmail, "message", "Verification code sent"));
    }

    @PostMapping("/mfa/setup")
    @Operation(summary = "Enable email MFA for a user",
               description = "Activates MFA on the account and sends the first OTP to the user's email. " +
                             "Required for DISPATCHER and ADMIN roles.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "MFA enabled, masked email returned"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<Map<String, String>> setupMfa(
            @Parameter(description = "UUID of the user") @RequestParam UUID userId) {
        String maskedEmail = authService.setupMfa(userId);
        return ResponseEntity.ok(Map.of("maskedEmail", maskedEmail, "message", "MFA enabled. Check your email."));
    }

    @PostMapping("/mfa/verify")
    @Operation(summary = "Verify email OTP and obtain full-access JWT",
               description = "Accepts the 6-digit code from the email. On success the session is marked " +
                             "MFA-verified and a full-access JWT is returned. Codes expire after 10 minutes.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "MFA verified, full JWT returned"),
        @ApiResponse(responseCode = "401", description = "Invalid or expired code")
    })
    public ResponseEntity<AuthResponse> verifyMfa(@Valid @RequestBody MfaVerifyRequest req) {
        return ResponseEntity.ok(authService.verifyMfa(req));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "New tokens returned"),
        @ApiResponse(responseCode = "401", description = "Refresh token invalid or expired")
    })
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req));
    }

    @PostMapping("/logout")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Logout current user")
    @ApiResponse(responseCode = "204", description = "Logged out")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) authService.logout(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) return forwarded.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
