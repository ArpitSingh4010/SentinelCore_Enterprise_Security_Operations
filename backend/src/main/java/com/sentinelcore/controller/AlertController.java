package com.sentinelcore.controller;

import com.sentinelcore.dto.AlertResponse;
import com.sentinelcore.dto.IncidentResponse;
import com.sentinelcore.model.Alert;
import com.sentinelcore.security.UserPrincipal;
import com.sentinelcore.service.AlertService;
import com.sentinelcore.service.IncidentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;
    
    @Autowired
    private IncidentService incidentService;

    @GetMapping
    public ResponseEntity<Page<AlertResponse>> getAlerts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<AlertResponse> alerts = alertService.getAlerts(search, status, severity, pageable)
                .map(AlertResponse::fromAlert);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertResponse> getAlertById(@PathVariable String id) {
        return ResponseEntity.ok(AlertResponse.fromAlert(alertService.getAlertById(id)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AlertResponse> updateAlertStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        
        String status = payload.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(AlertResponse.fromAlert(alertService.updateAlertStatus(id, status)));
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<AlertResponse> acknowledgeAlert(@PathVariable String id) {
        return ResponseEntity.ok(AlertResponse.fromAlert(alertService.acknowledgeAlert(id)));
    }

    @PutMapping("/{id}/dismiss")
    public ResponseEntity<AlertResponse> dismissAlert(@PathVariable String id) {
        return ResponseEntity.ok(AlertResponse.fromAlert(alertService.dismissAlert(id)));
    }

    @PostMapping("/{id}/incident")
    public ResponseEntity<IncidentResponse> createIncidentFromAlert(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String userEmail = userPrincipal != null ? userPrincipal.getUsername() : "system@sentinelcore.local";
        IncidentResponse incident = incidentService.createIncidentFromAlert(id, userEmail);
        return ResponseEntity.ok(incident);
    }
}
