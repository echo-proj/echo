package com.echoproject.echo.notification.service;

import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.notification.dto.NotificationResponse;
import com.echoproject.echo.notification.models.Notification;
import com.echoproject.echo.notification.models.NotificationType;
import com.echoproject.echo.notification.repository.NotificationRepository;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public List<NotificationResponse> getUserNotifications(UUID userId) {
    List<Notification> notifications =
        notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);

    return notifications.stream().map(this::toResponse).collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public long getUnreadCount(UUID userId) {
    return notificationRepository.countUnreadByRecipientId(userId);
  }

  @Transactional
  public void markAsRead(UUID userId, UUID notificationId) {
    Notification notification =
        notificationRepository
            .findById(notificationId)
            .orElseThrow(() -> new NotFoundException("Notification not found"));

    if (!notification.getRecipient().getId().equals(userId)) {
      throw new NotFoundException("Notification not found");
    }

    notification.setRead(true);
    notificationRepository.save(notification);
  }

  @Transactional
  public void markAllAsRead(UUID userId) {
    List<Notification> notifications =
        notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);

    notifications.forEach(n -> n.setRead(true));
    notificationRepository.saveAll(notifications);
  }

  @Transactional
  public void deleteNotification(UUID userId, UUID notificationId) {
    Notification notification =
        notificationRepository
            .findById(notificationId)
            .orElseThrow(() -> new NotFoundException("Notification not found"));

    if (!notification.getRecipient().getId().equals(userId)) {
      throw new NotFoundException("Notification not found");
    }

    notificationRepository.delete(notification);
  }

  @Transactional
  public void createNotification(
      UUID recipientId, NotificationType type, UUID documentId, UUID actorId) {
    User recipient =
        userRepository
            .findById(recipientId)
            .orElseThrow(() -> new NotFoundException("Recipient not found"));

    User actor =
        userRepository.findById(actorId).orElseThrow(() -> new NotFoundException("Actor not found"));

    Notification notification = new Notification(recipient, type, documentId, actor);
    notificationRepository.save(notification);
  }

  private NotificationResponse toResponse(Notification notification) {
    return new NotificationResponse(
        notification.getId(),
        notification.getType(),
        notification.getDocumentId(),
        notification.getActor().getUsername(),
        notification.isRead(),
        notification.getCreatedAt(),
        notification.getUpdatedAt());
  }
}
