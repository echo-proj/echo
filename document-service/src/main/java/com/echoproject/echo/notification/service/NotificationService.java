package com.echoproject.echo.notification.service;

import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.notification.dto.NotificationResponse;
import com.echoproject.echo.notification.models.Notification;
import com.echoproject.echo.notification.models.NotificationType;
import com.echoproject.echo.notification.repository.NotificationRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {
  private final NotificationRepository repository;
  private final com.echoproject.echo.user.repository.UserRepository userRepository;

  @Transactional(readOnly = true)
  public List<NotificationResponse> getUserNotifications(UUID userId) {
    List<Notification> notifications = repository.findByRecipient(userId);
    // Batch-load actor usernames to avoid N+1
    Set<UUID> actorIds = notifications.stream().map(Notification::getActorId).collect(Collectors.toSet());
    Map<UUID, String> usernames = userRepository.findAllById(actorIds)
        .stream().collect(Collectors.toMap(u -> u.getId(), u -> u.getUsername()));

    return notifications.stream()
        .map(n -> toResponse(n, usernames.get(n.getActorId())))
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public long getUnreadCount(UUID userId) {
    return repository.countUnread(userId);
  }

  @Transactional
  public void markAsRead(UUID userId, UUID notificationId) {
    Notification notification = repository.findById(notificationId)
        .orElseThrow(() -> new NotFoundException("Notification not found"));

    if (!notification.getRecipientId().equals(userId)) {
      throw new NotFoundException("Notification not found");
    }

    notification.setRead(true);
    repository.save(notification);
  }

  @Transactional
  public void markAllAsRead(UUID userId) {
    List<Notification> notifications = repository.findByRecipient(userId);
    notifications.forEach(n -> n.setRead(true));
    repository.saveAll(notifications);
  }

  @Transactional
  public void deleteNotification(UUID userId, UUID notificationId) {
    Notification notification = repository.findById(notificationId)
        .orElseThrow(() -> new NotFoundException("Notification not found"));

    if (!notification.getRecipientId().equals(userId)) {
      throw new NotFoundException("Notification not found");
    }

    repository.delete(notification);
  }

  @Transactional
  public void createNotification(UUID recipientId, NotificationType type, UUID documentId, UUID actorId) {
    repository.save(new Notification(recipientId, type, documentId, actorId));
  }

  private NotificationResponse toResponse(Notification notification, String actorUsername) {
    return new NotificationResponse(
        notification.getId(),
        notification.getType(),
        notification.getDocumentId(),
        notification.getActorId(),
        actorUsername,
        notification.isRead(),
        notification.getCreatedAt(),
        notification.getUpdatedAt()
    );
  }
}
