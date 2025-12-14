package com.echoproject.echo.document.controller;

import com.echoproject.echo.document.dto.AddCollaboratorRequest;
import com.echoproject.echo.document.dto.CreateDocumentRequest;
import com.echoproject.echo.document.dto.DocumentContentResponse;
import com.echoproject.echo.document.dto.DocumentResponse;
import com.echoproject.echo.document.dto.UpdateDocumentRequest;
import com.echoproject.echo.document.dto.ValidateDocumentAccessRequest;
import com.echoproject.echo.document.dto.ValidateDocumentAccessResponse;
import com.echoproject.echo.document.service.DocumentService;
import com.echoproject.echo.security.service.CustomUserDetails;
import com.echoproject.echo.user.dto.UserSearchResponse;
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

  @PutMapping("/{id}")
  public ResponseEntity<DocumentResponse> updateDocument(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID id,
      @Valid @RequestBody UpdateDocumentRequest request) {
    DocumentResponse document = documentService.updateDocument(userDetails.getId(), id, request);
    return ResponseEntity.ok(document);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteDocument(
      @AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID id) {
    documentService.deleteDocument(userDetails.getId(), id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/available-collaborators")
  public ResponseEntity<List<UserSearchResponse>> searchAvailableCollaborators(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID id,
      @RequestParam(required = false) String query) {
    List<UserSearchResponse> users = documentService.searchAvailableCollaborators(userDetails.getId(), id, query);
    return ResponseEntity.ok(users);
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

  @GetMapping("/{id}/content")
  public ResponseEntity<byte[]> getDocumentContent(
      @AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable UUID id) {
    DocumentContentResponse content = documentService.getDocumentContent(userDetails.getId(), id);
    return ResponseEntity.ok()
        .header("Content-Type", "application/octet-stream")
        .body(content.getState());
  }

  @PostMapping("/validate-access")
  public ResponseEntity<ValidateDocumentAccessResponse> validateDocumentAccess(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody ValidateDocumentAccessRequest request) {

    boolean hasAccess =
        documentService.validateDocumentAccess(userDetails.getId(), request.getDocumentId());

    return ResponseEntity.ok(
        new ValidateDocumentAccessResponse(
            hasAccess, userDetails.getId(), userDetails.getUsername()));
  }

  @PostMapping("/{id}/content")
  public ResponseEntity<Void> saveDocumentContent(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable UUID id,
      @RequestBody byte[] state) {
    documentService.saveDocumentContent(userDetails.getId(), id, state);
    return ResponseEntity.noContent().build();
  }
}
