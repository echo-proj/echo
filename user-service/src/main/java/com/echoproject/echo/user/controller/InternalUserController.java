package com.echoproject.echo.user.controller;

import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.user.dto.UserSearchResponse;
import com.echoproject.echo.user.dto.UserSummaryResponse;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

  private final UserRepository userRepository;

  @GetMapping("/{id}/summary")
  public ResponseEntity<UserSummaryResponse> getSummary(@PathVariable UUID id) {
    User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    return ResponseEntity.ok(toSummary(user));
  }

  @PostMapping("/summaries")
  public ResponseEntity<List<UserSummaryResponse>> getSummaries(@RequestBody List<UUID> ids) {
    List<User> users = userRepository.findAllById(ids);
    return ResponseEntity.ok(users.stream().map(this::toSummary).toList());
  }

  @GetMapping("/by-username/{username}")
  public ResponseEntity<Map<String, Object>> getByUsername(@PathVariable String username) {
    User user = userRepository.findByUsername(username).orElseThrow(() -> new NotFoundException("User not found"));
    return ResponseEntity.ok(Map.of("id", user.getId(), "username", user.getUsername()));
  }

  @GetMapping("/search")
  public ResponseEntity<List<UserSearchResponse>> search(@RequestParam String query) {
    if (query == null || query.isBlank()) return ResponseEntity.ok(List.of());
    List<User> users = userRepository.searchByUsername(query.trim());
    return ResponseEntity.ok(users.stream().map(u -> new UserSearchResponse(
        u.getId(),
        u.getUsername(),
        u.getProfile() != null ? u.getProfile().getFullName() : null,
        u.getProfile() != null ? u.getProfile().getProfilePicture() : null
    )).limit(10).toList());
  }

  private UserSummaryResponse toSummary(User u) {
    return new UserSummaryResponse(
        u.getId(),
        u.getUsername(),
        u.getProfile() != null ? u.getProfile().getFullName() : null,
        u.getProfile() != null ? u.getProfile().getProfilePicture() : null);
  }
}

