package com.echoproject.echo.notification.controller;

import com.echoproject.echo.notification.dto.NotificationResponse;
import com.echoproject.echo.notification.service.NotificationService;
import com.echoproject.echo.security.service.CustomUserDetails;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
  private final NotificationService notificationService;

  @GetMapping
  public ResponseEntity<List<NotificationResponse>> getNotifications(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    List<NotificationResponse> notifications =
        notificationService.getUserNotifications(userDetails.getId());
    return ResponseEntity.ok(notifications);
  }

  @GetMapping("/unread-count")
  public ResponseEntity<Map<String, Long>> getUnreadCount(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    long count = notificationService.getUnreadCount(userDetails.getId());
    return ResponseEntity.ok(Map.of("count", count));
  }

  @PutMapping("/{id}/read")
  public ResponseEntity<Void> markAsRead(
      @AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID id) {
    notificationService.markAsRead(userDetails.getId(), id);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/read-all")
  public ResponseEntity<Void> markAllAsRead(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    notificationService.markAllAsRead(userDetails.getId());
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteNotification(
      @AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID id) {
    notificationService.deleteNotification(userDetails.getId(), id);
    return ResponseEntity.noContent().build();
  }
}
