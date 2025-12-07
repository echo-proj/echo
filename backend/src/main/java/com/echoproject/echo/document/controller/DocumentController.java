package com.echoproject.echo.document.controller;

import com.echoproject.echo.document.dto.AddCollaboratorRequest;
import com.echoproject.echo.document.dto.CreateDocumentRequest;
import com.echoproject.echo.document.dto.DocumentResponse;
import com.echoproject.echo.document.service.DocumentService;
import com.echoproject.echo.security.service.CustomUserDetails;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

  private final DocumentService documentService;

  @PostMapping
  public ResponseEntity<DocumentResponse> createDocument(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody CreateDocumentRequest request) {
    DocumentResponse response = documentService.createDocument(userDetails.getId(), request);
    return ResponseEntity.ok(response);
  }

  @GetMapping
  public ResponseEntity<List<DocumentResponse>> getUserDocuments(
      @AuthenticationPrincipal CustomUserDetails userDetails) {
    List<DocumentResponse> documents = documentService.getUserDocuments(userDetails.getId());
    return ResponseEntity.ok(documents);
  }

  @GetMapping("/{id}")
  public ResponseEntity<DocumentResponse> getDocument(
      @AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID id) {
    DocumentResponse document = documentService.getDocument(userDetails.getId(), id);
    return ResponseEntity.ok(document);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteDocument(
      @AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID id) {
    documentService.deleteDocument(userDetails.getId(), id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{id}/collaborators")
  public ResponseEntity<Void> addCollaborator(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID id,
      @Valid @RequestBody AddCollaboratorRequest request) {
    documentService.addCollaborator(userDetails.getId(), id, request);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{id}/collaborators/{userId}")
  public ResponseEntity<Void> removeCollaborator(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID id,
      @PathVariable UUID userId) {
    documentService.removeCollaborator(userDetails.getId(), id, userId);
    return ResponseEntity.noContent().build();
  }
}
