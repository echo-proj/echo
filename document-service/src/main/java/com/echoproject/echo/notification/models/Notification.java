package com.echoproject.echo.notification.models;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {
  @Id private UUID id;
  @Column(name = "recipient_id", nullable = false) private UUID recipientId;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private NotificationType type;
  @Column(name = "document_id", nullable = false) private UUID documentId;
  @Column(name = "actor_id", nullable = false) private UUID actorId;
  @Column(name = "read", nullable = false) private boolean read;
  @Column(name = "created_at", nullable = false) private Instant createdAt;
  @Column(name = "updated_at", nullable = false) private Instant updatedAt;
  public Notification(UUID recipientId, NotificationType type, UUID documentId, UUID actorId) {
    this.id = UUID.randomUUID(); this.recipientId = recipientId; this.type = type; this.documentId = documentId; this.actorId = actorId; this.read = false; this.createdAt = Instant.now(); this.updatedAt = Instant.now();
  }
}

