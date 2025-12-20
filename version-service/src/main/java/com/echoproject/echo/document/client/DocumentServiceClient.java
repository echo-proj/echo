package com.echoproject.echo.document.client;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class DocumentServiceClient {

  private final RestTemplate restTemplate;

  @Value("${document.service.url:http://gateway:8080}")
  private String baseUrl;

  public byte[] getContent(UUID documentId, String authorization) {
    String url = baseUrl + "/api/documents/" + documentId + "/content";
    HttpHeaders headers = new HttpHeaders();
    if (authorization != null) headers.set("Authorization", authorization);
    HttpEntity<Void> entity = new HttpEntity<>(headers);
    ResponseEntity<byte[]> res = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, byte[].class);
    return res.getBody() != null ? res.getBody() : new byte[0];
  }

  public void overwriteContent(UUID documentId, byte[] state, String authorization) {
    String url = baseUrl + "/api/internal/documents/" + documentId + "/content";
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
    if (authorization != null) headers.set("Authorization", authorization);
    HttpEntity<byte[]> entity = new HttpEntity<>(state, headers);
    ResponseEntity<Void> res = restTemplate.postForEntity(url, entity, Void.class);
    if (!res.getStatusCode().is2xxSuccessful()) {
      throw new RuntimeException("Failed to overwrite content: status=" + res.getStatusCode());
    }
  }
}
