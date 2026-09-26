/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.auth.config;

import com.emergencyconnect.shared.filter.RateLimitFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

@Configuration
public class RateLimitConfig {

    @Value("${app.rate-limit.max-requests-per-minute:300}")
    private int maxRequestsPerMinute;

    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilter(StringRedisTemplate redisTemplate) {
        RateLimitFilter filter = new RateLimitFilter(redisTemplate, maxRequestsPerMinute);
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>(filter);
        registration.addUrlPatterns("/api/*");
        registration.setOrder(1);
        return registration;
    }
}
