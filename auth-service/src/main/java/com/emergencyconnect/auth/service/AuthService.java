/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.service;

import com.emergencyconnect.auth.dto.*;
import com.emergencyconnect.auth.kafka.AuthEventProducer;
import com.emergencyconnect.auth.model.IpBlacklist;
import com.emergencyconnect.auth.model.IpWhitelist;
import com.emergencyconnect.auth.model.RefreshToken;
import com.emergencyconnect.auth.model.Role;
import com.emergencyconnect.auth.model.User;
import com.emergencyconnect.auth.repository.IpBlacklistRepository;
import com.emergencyconnect.auth.repository.IpWhitelistRepository;
import com.emergencyconnect.auth.repository.RefreshTokenRepository;
import com.emergencyconnect.auth.repository.UserRepository;
import com.emergencyconnect.shared.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final IpBlacklistRepository ipBlacklistRepository;
    private final IpWhitelistRepository ipWhitelistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SessionService sessionService;
    private final MfaService mfaService;
    private final StringRedisTemplate redisTemplate;
    private final AuthEventProducer authEventProducer;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long RATE_LIMIT_MINUTES = 1;

    @Transactional
    public UserDTO register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .active(true)
                .build();
        user = userRepository.save(user);
        return toDTO(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req, String ipAddress) {
        checkIpBlacklist(ipAddress);
        checkRateLimit(ipAddress);

        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> {
                    recordFailedAttempt(ipAddress);
                    return new BadCredentialsException("Invalid credentials");
                });

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            recordFailedAttempt(ipAddress);
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new IllegalStateException("Account is disabled");
        }

        clearFailedAttempts(ipAddress);
        authEventProducer.publishLoginSuccess(user.getId().toString(), user.getUsername(), ipAddress);

        boolean isMfaRole = user.getRole() == Role.DISPATCHER || user.getRole() == Role.ADMIN;
        if (isMfaRole && !user.isMfaEnabled()) {
            user.setMfaEnabled(true);
            userRepository.save(user);
        }
        boolean mfaRequired = isMfaRole;

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getUsername(), user.getRole().name(), !mfaRequired);
        String refreshToken = generateAndSaveRefreshToken(user);

        sessionService.createSession(user.getId().toString(), user.getUsername(),
                user.getRole().name(), ipAddress, !mfaRequired);

        String maskedEmail = null;
        if (mfaRequired) {
            mfaService.sendCode(user.getId().toString(), user.getEmail());
            maskedEmail = maskEmail(user.getEmail());
        }

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600)
                .role(user.getRole().name())
                .mfaRequired(mfaRequired)
                .userId(user.getId().toString())
                .maskedEmail(maskedEmail)
                .build();
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest req) {
        String hash = hashToken(req.getRefreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new BadCredentialsException("Refresh token expired");
        }

        User user = stored.getUser();
        String newAccess = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getUsername(), user.getRole().name(), true);
        String newRefresh = generateAndSaveRefreshToken(user);
        refreshTokenRepository.delete(stored);

        return AuthResponse.builder()
                .accessToken(newAccess)
                .refreshToken(newRefresh)
                .tokenType("Bearer")
                .expiresIn(3600)
                .role(user.getRole().name())
                .userId(user.getId().toString())
                .build();
    }

    public void logout(String userId) {
        sessionService.deleteSession(userId);
        User user = userRepository.findById(UUID.fromString(userId)).orElse(null);
        if (user != null) {
            refreshTokenRepository.deleteByUser(user);
            authEventProducer.publishLogout(userId, user.getUsername());
        }
    }

        @Transactional
    public String setupMfa(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setMfaEnabled(true);
        userRepository.save(user);
        mfaService.sendCode(userId.toString(), user.getEmail());
        return maskEmail(user.getEmail());
    }

    @Transactional
    public String sendMfaCode(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        mfaService.sendCode(userId.toString(), user.getEmail());
        return maskEmail(user.getEmail());
    }

    @Transactional
    public AuthResponse verifyMfa(MfaVerifyRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!mfaService.verifyCode(user.getId().toString(), req.getTotpCode())) {
            throw new BadCredentialsException("Invalid or expired verification code");
        }

        user.setMfaEnabled(true);
        userRepository.save(user);
        sessionService.markMfaVerified(user.getId().toString());
        authEventProducer.publishMfaVerified(user.getId().toString(), user.getUsername());

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getUsername(), user.getRole().name(), true);
        String refreshToken = generateAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600)
                .role(user.getRole().name())
                .userId(user.getId().toString())
                .build();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String local = parts[0];
        String visible = local.length() <= 2 ? local : local.substring(0, 2);
        return visible + "***@" + parts[1];
    }

    public Page<UserDTO> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDTO);
    }

    @Transactional
    public void activateUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(true);
        userRepository.save(user);
    }

    @Transactional
    public void blacklistIp(BlacklistIpRequest req) {
        if (!ipBlacklistRepository.existsByIpAddress(req.getIpAddress())) {
            ipBlacklistRepository.save(IpBlacklist.builder()
                    .ipAddress(req.getIpAddress())
                    .reason(req.getReason())
                    .build());
        }
    }

    @Transactional
    public void unblacklistIp(String ip) {
        ipBlacklistRepository.findByIpAddress(ip).ifPresent(ipBlacklistRepository::delete);
    }

    public Page<IpBlacklist> listBlacklist(Pageable pageable) {
        return ipBlacklistRepository.findAll(pageable);
    }

    @Transactional
    public void whitelistIp(String ipAddress, String description, String addedBy) {
        if (!ipWhitelistRepository.existsByIpAddress(ipAddress)) {
            ipWhitelistRepository.save(IpWhitelist.builder()
                    .ipAddress(ipAddress)
                    .description(description)
                    .addedBy(addedBy)
                    .build());
        }
    }

    @Transactional
    public void removeFromWhitelist(String ip) {
        ipWhitelistRepository.findByIpAddress(ip).ifPresent(ipWhitelistRepository::delete);
    }

    public Page<IpWhitelist> listWhitelist(Pageable pageable) {
        return ipWhitelistRepository.findAll(pageable);
    }

    public boolean isIpWhitelisted(String ip) {
        return ipWhitelistRepository.existsByIpAddress(ip);
    }

    @Transactional
    public void deactivateUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    private void checkIpBlacklist(String ip) {
        if (ipBlacklistRepository.existsByIpAddress(ip)) {
            throw new IllegalStateException("IP address is blacklisted");
        }
    }

    private void checkRateLimit(String ip) {
        String key = "ratelimit:" + ip;
        String val = redisTemplate.opsForValue().get(key);
        if (val != null && Integer.parseInt(val) >= 100) {
            throw new IllegalStateException("Rate limit exceeded");
        }
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, RATE_LIMIT_MINUTES, TimeUnit.MINUTES);
    }

    private void recordFailedAttempt(String ip) {
        String key = "failedlogin:" + ip;
        Long count = redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, 15, TimeUnit.MINUTES);
        authEventProducer.publishLoginFailure("unknown", ip);
        if (count != null && count >= MAX_FAILED_ATTEMPTS) {
            ipBlacklistRepository.save(IpBlacklist.builder()
                    .ipAddress(ip)
                    .reason("Auto-blacklisted: " + MAX_FAILED_ATTEMPTS + " failed login attempts")
                    .build());
            authEventProducer.publishIpBlacklisted(ip,
                    "Auto-blacklisted after " + MAX_FAILED_ATTEMPTS + " failed attempts", "system");
        }
    }

    private void clearFailedAttempts(String ip) {
        redisTemplate.delete("failedlogin:" + ip);
    }

    private String generateAndSaveRefreshToken(User user) {
        String raw = UUID.randomUUID().toString();
        String hash = hashToken(raw);
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(hash)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();
        refreshTokenRepository.save(token);
        return raw;
    }

    private String hashToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .mfaEnabled(user.isMfaEnabled())
                .build();
    }
}