/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
package com.emergencyconnect.dispatch.service;

import com.emergencyconnect.dispatch.client.ResourceServiceClient;
import com.emergencyconnect.dispatch.client.ResourceServiceClient.UnitDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartDispatchEngine {

    private final ResourceServiceClient resourceServiceClient;

    private static final Map<String, Double> SEVERITY_MULTIPLIERS = Map.of(
            "CRITICAL", 4.0,
            "HIGH",     3.0,
            "MEDIUM",   2.0,
            "LOW",      1.0
    );

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnitRecommendation {
        private int rank;
        private UnitDTO unit;
        private double score;
        private double distanceKm;
        private int estimatedArrivalMinutes;
        private ScoreBreakdown scoreBreakdown;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreBreakdown {
        private double severityScore;
        private double proximityScore;
        private double slaScore;
    }

    public List<UnitRecommendation> recommend(
            BigDecimal incidentLat, BigDecimal incidentLon,
            String severity, String emirate, int topN) {

        UnitDTO[] available = resourceServiceClient.listAvailableUnits(emirate);
        if (available == null || available.length == 0) {
            return List.of();
        }

        double severityMultiplier = SEVERITY_MULTIPLIERS.getOrDefault(severity, 1.0);
        double maxDist = findMaxDistance(available, incidentLat.doubleValue(), incidentLon.doubleValue());

        List<UnitRecommendation> recommendations = new ArrayList<>();
        for (UnitDTO unit : available) {
            if (unit.getCurrentLatitude() == null || unit.getCurrentLongitude() == null) continue;

            double dist = haversineKm(
                    incidentLat.doubleValue(), incidentLon.doubleValue(),
                    unit.getCurrentLatitude().doubleValue(), unit.getCurrentLongitude().doubleValue());

            double proximityScore = maxDist > 0 ? 1.0 - (dist / maxDist) : 1.0;
            double slaScore = 0.9;
            double severityScore = (severityMultiplier / 4.0) * 0.40;
            double proxScore = proximityScore * 0.35;
            double slaFinal = slaScore * 0.10;
            double totalScore = severityScore + proxScore + slaFinal;

            int eta = (int) Math.ceil((dist / 40.0) * 60);

            recommendations.add(UnitRecommendation.builder()
                    .unit(unit)
                    .score(Math.round(totalScore * 100.0) / 100.0)
                    .distanceKm(Math.round(dist * 10.0) / 10.0)
                    .estimatedArrivalMinutes(eta)
                    .scoreBreakdown(ScoreBreakdown.builder()
                            .severityScore(Math.round(severityScore * 100.0) / 100.0)
                            .proximityScore(Math.round(proxScore * 100.0) / 100.0)
                            .slaScore(Math.round(slaFinal * 100.0) / 100.0)
                            .build())
                    .build());
        }

        List<UnitRecommendation> sorted = recommendations.stream()
                .sorted(Comparator.comparingDouble(UnitRecommendation::getScore).reversed())
                .limit(topN)
                .toList();

        for (int i = 0; i < sorted.size(); i++) {
            sorted.get(i).setRank(i + 1);
        }
        return sorted;
    }

    private double findMaxDistance(UnitDTO[] units, double lat, double lon) {
        double max = 0;
        for (UnitDTO unit : units) {
            if (unit.getCurrentLatitude() == null || unit.getCurrentLongitude() == null) continue;
            double d = haversineKm(lat, lon,
                    unit.getCurrentLatitude().doubleValue(), unit.getCurrentLongitude().doubleValue());
            if (d > max) max = d;
        }
        return max;
    }

    public static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
