package com.echoproject.echo.document.controller;

import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.document.models.Document;
import com.echoproject.echo.document.models.DocumentCollaborator;
import com.echoproject.echo.document.repository.DocumentCollaboratorRepository;
import com.echoproject.echo.document.repository.DocumentRepository;
import com.echoproject.echo.document.service.DocumentService;
import com.echoproject.echo.user.client.UserServiceClient;
import com.echoproject.echo.security.service.CustomUserDetails;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/documents")
@RequiredArgsConstructor
public class InternalDocumentController {

  private final DocumentRepository documentRepository;
  private final DocumentCollaboratorRepository collaboratorRepository;
  private final DocumentService documentService;
  private final UserServiceClient userClient;

  @GetMapping("/{id}/owner")
  public ResponseEntity<Map<String, Object>> getOwner(@PathVariable UUID id) {
    Document document = documentRepository.findById(id).orElseThrow(() -> new NotFoundException("Document not found"));
    var ownerId = document.getOwnerId();
    var sum = userClient.getSummaries(java.util.Set.of(ownerId)).get(ownerId);
    String ownerUsername = sum != null ? sum.username() : null;
    return ResponseEntity.ok(Map.of(
        "ownerId", ownerId,
        "ownerUsername", ownerUsername
    ));
  }

  @GetMapping("/{id}/collaborators")
  public ResponseEntity<Map<String, Object>> getCollaborators(@PathVariable UUID id) {
    List<DocumentCollaborator> list = collaboratorRepository.findByDocumentId(id);
    List<UUID> ids = list.stream().map(DocumentCollaborator::getUserId).collect(Collectors.toList());
    return ResponseEntity.ok(Map.of("collaboratorIds", ids));
  }

  @PostMapping("/{id}/content")
  public ResponseEntity<Void> overwriteContent(
      @AuthenticationPrincipal CustomUserDetails user,
      @PathVariable UUID id,
      @RequestBody byte[] state
  ) {
    documentService.saveDocumentContent(user.getId(), id, state);
    return ResponseEntity.noContent().build();
  }
}
