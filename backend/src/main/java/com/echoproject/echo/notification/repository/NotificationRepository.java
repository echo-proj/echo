package com.echoproject.echo.notification.repository;

import com.echoproject.echo.notification.models.Notification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

  @Query(
      "SELECT n FROM Notification n WHERE n.recipient.id = :userId ORDER BY n.createdAt DESC")
  List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID userId);

  @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :userId AND n.read = false")
  long countUnreadByRecipientId(UUID userId);
}
