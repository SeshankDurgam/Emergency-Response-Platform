/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailOtpService {

    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;

    @Value("${app.mfa.otp-ttl-minutes:10}")
    private int otpTtlMinutes;

    @Value("${app.mfa.otp-from:EmergencyConnect UAE <noreply@emergencyconnect.ae>}")
    private String fromAddress;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public void sendOtp(String userId, String recipientEmail) {
        String code = generateCode();
        String key  = redisKey(userId);

        redisTemplate.opsForValue().set(key, code, otpTtlMinutes, TimeUnit.MINUTES);
        log.info("MFA OTP generated for user {} (expires in {} min): CODE IS {}", userId, otpTtlMinutes, code);

        sendEmail(recipientEmail, code);
    }

    public boolean verifyOtp(String userId, String submittedCode) {
        String key   = redisKey(userId);
        String stored = redisTemplate.opsForValue().get(key);

        if (stored == null) {
            log.warn("MFA OTP verification failed for user {}: code expired or never sent", userId);
            return false;
        }

        boolean match = stored.equals(submittedCode.trim());
        if (match) {
            redisTemplate.delete(key);
            log.info("MFA OTP verified successfully for user {}", userId);
        } else {
            log.warn("MFA OTP mismatch for user {}", userId);
        }
        return match;
    }

    private String generateCode() {
        int code = 100_000 + SECURE_RANDOM.nextInt(900_000);
        return String.valueOf(code);
    }

    private String redisKey(String userId) {
        return "mfa:otp:" + userId;
    }

    private void sendEmail(String to, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("EmergencyConnect UAE - Your Verification Code");
            helper.setText(buildHtml(code), true);

            mailSender.send(message);
            log.info("MFA OTP email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send MFA email to {}: {}", to, e.getMessage());
            
        }
    }

    private String buildHtml(String code) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
                <tr><td align="center">
                  <table width="480" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
                    <tr>
                      <td style="background:#f97316;padding:28px 32px;">
                        <div style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                          EmergencyConnect <span style="color:rgba(255,255,255,0.7)">UAE</span>
                        </div>
                        <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px;">
                          Operator Portal Security
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px;">
                        <p style="margin:0 0 8px;font-size:14px;color:#64748b;">
                          Your verification code
                        </p>
                        <div style="font-size:40px;font-weight:900;letter-spacing:8px;color:#0f172a;
                                    background:#f1f5f9;border-radius:12px;padding:20px;
                                    text-align:center;margin:16px 0;">
                          %s
                        </div>
                        <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
                          This code expires in <strong>10 minutes</strong>. If you did not request
                          this code, please contact your system administrator immediately.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;font-size:11px;color:#94a3b8;">
                          This is an automated message from EmergencyConnect UAE.
                          Do not reply to this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(code);
    }
}
