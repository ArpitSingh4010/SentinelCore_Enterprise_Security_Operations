package com.sentinelcore.service;

import com.sentinelcore.model.Alert;
import com.sentinelcore.model.Incident;
import com.sentinelcore.repository.AlertRepository;
import com.sentinelcore.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final List<String> ACTIVE_ALERT_STATUSES = List.of("NEW", "OPEN", "INVESTIGATING", "ACKNOWLEDGED");
    private static final List<String> ACTIVE_INCIDENT_STATUSES = List.of("OPEN", "TRIAGED", "IN_PROGRESS");

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private RiskScoringService riskScoringService;

    @Autowired
    private VulnerabilityService vulnerabilityService;

    public List<Map<String, Object>> getNotifications() {
        List<Map<String, Object>> notifications = new ArrayList<>();

        alertRepository.findAll().stream()
                .filter(alert -> ACTIVE_ALERT_STATUSES.contains(normalize(alert.getStatus(), "NEW")))
                .filter(alert -> severityRank(alert.getSeverity()) >= severityRank("HIGH"))
                .forEach(alert -> notifications.add(alertNotification(alert)));

        incidentRepository.findAll().stream()
                .filter(incident -> ACTIVE_INCIDENT_STATUSES.contains(normalize(incident.getStatus(), "OPEN")))
                .filter(incident -> priorityRank(incident.getPriority()) >= priorityRank("P2"))
                .forEach(incident -> notifications.add(incidentNotification(incident)));

        riskScoringService.getAssetRiskScores().stream()
                .filter(assetRisk -> (Integer) assetRisk.get("riskScore") >= 60)
                .forEach(assetRisk -> notifications.add(riskNotification(assetRisk)));

        notifications.addAll(vulnerabilityService.getNotifications());

        return notifications.stream()
                .sorted(Comparator.comparing(this::createdAt, Comparator.reverseOrder()))
                .limit(50)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getSummary() {
        List<Map<String, Object>> notifications = getNotifications();
        return Map.of(
                "unreadCount", notifications.size(),
                "criticalCount", notifications.stream()
                        .filter(item -> "CRITICAL".equals(item.get("severity")))
                        .count(),
                "notifications", notifications
        );
    }

    private Map<String, Object> alertNotification(Alert alert) {
        return Map.of(
                "id", "alert:" + alert.getId(),
                "source", "ALERT",
                "type", "SECURITY_ALERT",
                "severity", normalize(alert.getSeverity(), "MEDIUM"),
                "title", defaultValue(alert.getTitle(), "Security alert"),
                "message", defaultValue(alert.getDescription(), "A high priority alert requires attention."),
                "entityId", defaultValue(alert.getId(), ""),
                "createdAt", alert.getUpdatedAt() == null ? defaultTime(alert.getCreatedAt()) : alert.getUpdatedAt()
        );
    }

    private Map<String, Object> incidentNotification(Incident incident) {
        String severity = "P1".equals(normalize(incident.getPriority(), "P3")) ? "CRITICAL" : "HIGH";
        return Map.of(
                "id", "incident:" + incident.getId(),
                "source", "INCIDENT",
                "type", "ACTIVE_INCIDENT",
                "severity", severity,
                "title", defaultValue(incident.getTitle(), "Active incident"),
                "message", defaultValue(incident.getDescription(), "A high priority incident is active."),
                "entityId", defaultValue(incident.getId(), ""),
                "createdAt", incident.getUpdatedAt() == null ? defaultTime(incident.getCreatedAt()) : incident.getUpdatedAt()
        );
    }

    private Map<String, Object> riskNotification(Map<String, Object> assetRisk) {
        return Map.of(
                "id", "risk:" + assetRisk.get("assetId"),
                "source", "RISK",
                "type", "CRITICAL_ASSET_RISK",
                "severity", "CRITICAL",
                "title", "Critical asset risk: " + assetRisk.get("assetName"),
                "message", "Risk score " + assetRisk.get("riskScore") + " with "
                        + assetRisk.get("openVulnerabilities") + " open vulnerabilities and "
                        + assetRisk.get("openIncidents") + " open incidents.",
                "entityId", defaultValue((String) assetRisk.get("assetId"), ""),
                "createdAt", LocalDateTime.now()
        );
    }

    private LocalDateTime createdAt(Map<String, Object> item) {
        Object value = item.get("createdAt");
        return value instanceof LocalDateTime ? (LocalDateTime) value : LocalDateTime.MIN;
    }

    private int severityRank(String severity) {
        String normalized = normalize(severity, "INFO");
        if ("CRITICAL".equals(normalized)) return 4;
        if ("HIGH".equals(normalized)) return 3;
        if ("MEDIUM".equals(normalized)) return 2;
        if ("LOW".equals(normalized)) return 1;
        return 0;
    }

    private int priorityRank(String priority) {
        String normalized = normalize(priority, "P4");
        if ("P1".equals(normalized)) return 4;
        if ("P2".equals(normalized)) return 3;
        if ("P3".equals(normalized)) return 2;
        return 1;
    }

    private String normalize(String value, String fallback) {
        return defaultValue(value, fallback).toUpperCase(Locale.ROOT);
    }

    private String defaultValue(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }

    private LocalDateTime defaultTime(LocalDateTime value) {
        return value == null ? LocalDateTime.now() : value;
    }
}
