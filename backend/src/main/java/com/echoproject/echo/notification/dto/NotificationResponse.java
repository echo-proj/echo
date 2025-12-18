package com.echoproject.echo.notification.dto;

import com.echoproject.echo.notification.models.NotificationType;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

  private UUID id;
  private NotificationType type;
  private UUID documentId;
  private String actorUsername;
  private boolean read;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
