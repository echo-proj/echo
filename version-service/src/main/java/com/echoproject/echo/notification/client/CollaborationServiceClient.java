package com.echoproject.echo.notification.client;

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
  @Value("${collaboration.service.url}") private String collaborationServiceUrl;
  public void reloadDocument(String documentId) {
    try { restTemplate.postForEntity(collaborationServiceUrl + "/reload-document/" + documentId, null, Void.class); }
    catch (Exception e) { log.warn("Failed to notify collab reload {}: {}", documentId, e.getMessage()); }
  }
}

