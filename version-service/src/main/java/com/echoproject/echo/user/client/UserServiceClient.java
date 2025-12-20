package com.echoproject.echo.user.client;

import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class UserServiceClient {

  private final RestTemplate restTemplate;

  @Value("${user.service.url:http://gateway:8080}")
  private String userServiceBaseUrl;

  public Map<UUID, String> getUsernames(Collection<UUID> ids) {
    if (ids == null || ids.isEmpty()) return Map.of();
    try {
      String url = userServiceBaseUrl + "/api/internal/users/summaries";
      HttpHeaders headers = authHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<Collection<UUID>> entity = new HttpEntity<>(ids, headers);
      ResponseEntity<List> res = restTemplate.exchange(url, HttpMethod.POST, entity, List.class);
      List list = res.getBody();
      if (list == null) return Map.of();
      Map<UUID, String> map = new HashMap<>();
      for (Object o : list) {
        Map m = (Map) o;
        UUID id = UUID.fromString(String.valueOf(m.get("id")));
        String uname = String.valueOf(m.get("username"));
        map.put(id, uname);
      }
      return map;
    } catch (Exception e) {
      return Map.of();
    }
  }

  public Optional<UserSummary> getByUsername(String username) {
    try {
      String url = userServiceBaseUrl + "/api/internal/users/by-username/" + encode(username);
      HttpHeaders headers = authHeaders();
      HttpEntity<Void> entity = new HttpEntity<>(headers);
      ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
      Map body = res.getBody();
      if (body != null) {
        UUID id = UUID.fromString(String.valueOf(body.get("id")));
        String uname = String.valueOf(body.get("username"));
        return Optional.of(new UserSummary(id, uname, null, null));
      }
    } catch (Exception ignored) {}
    return Optional.empty();
  }

  private String encode(String s) { try { return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8); } catch (Exception e) { return s; } }

  public record UserSummary(UUID id, String username, String fullName, String profilePicture) {}
  private HttpHeaders authHeaders() {
    HttpHeaders headers = new HttpHeaders();
    try {
      var attrs = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
      if (attrs instanceof org.springframework.web.context.request.ServletRequestAttributes sra) {
        String auth = sra.getRequest().getHeader("Authorization");
        if (auth != null) headers.set("Authorization", auth);
      }
    } catch (Exception ignored) {}
    return headers;
  }
}
