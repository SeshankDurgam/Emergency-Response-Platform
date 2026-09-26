/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MfaService {

    private final EmailOtpService emailOtpService;

    public void sendCode(String userId, String email) {
        emailOtpService.sendOtp(userId, email);
    }

    public boolean verifyCode(String userId, String code) {
        return emailOtpService.verifyOtp(userId, code);
    }
}
