package com.sentinelcore.controller;

import com.sentinelcore.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getNotifications() {
        return ResponseEntity.ok(notificationService.getNotifications());
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(notificationService.getSummary());
    }
}
