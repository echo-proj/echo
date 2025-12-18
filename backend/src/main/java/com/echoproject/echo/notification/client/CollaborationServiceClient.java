package com.echoproject.echo.notification.client;

import com.echoproject.echo.notification.dto.NotificationBroadcastRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollaborationServiceClient {

  private final RestTemplate restTemplate;

  @Value("${collaboration.service.url}")
  private String collaborationServiceUrl;

  public void broadcastDocumentUpdate(List<UUID> userIds, UUID documentId) {
    try {
      NotificationBroadcastRequest request = new NotificationBroadcastRequest(userIds, documentId);
      String url = collaborationServiceUrl + "/notify";
      restTemplate.postForEntity(url, request, Void.class);
    } catch (Exception e) {
      log.error("[BACKEND] Failed to broadcast document update: {}", e.getMessage());
    }
  }
}
