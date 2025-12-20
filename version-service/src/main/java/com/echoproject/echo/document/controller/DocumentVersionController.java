package com.echoproject.echo.document.controller;

import com.echoproject.echo.document.dto.CreateVersionRequest;
import com.echoproject.echo.document.dto.VersionContentResponse;
import com.echoproject.echo.document.dto.VersionResponse;
import com.echoproject.echo.document.service.DocumentVersionService;
import com.echoproject.echo.security.service.CustomUserDetails;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents/{documentId}/versions")
@RequiredArgsConstructor
public class DocumentVersionController {
  private final DocumentVersionService versionService;

  @PostMapping
  public ResponseEntity<VersionResponse> createVersion(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID documentId,
      @Valid @RequestBody CreateVersionRequest request) {
    return ResponseEntity.ok(versionService.createVersion(userDetails.getId(), documentId, request));
  }

  @GetMapping
  public ResponseEntity<List<VersionResponse>> getDocumentVersions(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID documentId) {
    return ResponseEntity.ok(versionService.getDocumentVersions(userDetails.getId(), documentId));
  }

  @GetMapping("/{versionId}")
  public ResponseEntity<byte[]> getVersionContent(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID documentId,
      @PathVariable UUID versionId) {
    VersionContentResponse content = versionService.getVersionContent(userDetails.getId(), documentId, versionId);
    return ResponseEntity.ok().header("Content-Type", "application/octet-stream").body(content.getState());
  }

  @PostMapping("/{versionId}/restore")
  public ResponseEntity<Void> restoreVersion(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID documentId,
      @PathVariable UUID versionId) {
    versionService.restoreVersion(userDetails.getId(), documentId, versionId);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{versionId}")
  public ResponseEntity<Void> deleteVersion(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID documentId,
      @PathVariable UUID versionId) {
    versionService.deleteVersion(userDetails.getId(), documentId, versionId);
    return ResponseEntity.noContent().build();
  }
}

