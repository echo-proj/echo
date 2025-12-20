package com.echoproject.echo.notification.repository;

import com.echoproject.echo.notification.models.Notification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
  @Query("SELECT n FROM Notification n WHERE n.recipientId = :userId ORDER BY n.createdAt DESC")
  List<Notification> findByRecipient(UUID userId);
  @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientId = :userId AND n.read = false")
  long countUnread(UUID userId);
}

