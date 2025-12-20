package com.echoproject.echo.notification.dto;

import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NotificationBroadcastRequest {
  private List<UUID> userIds;
  private UUID documentId;
}

