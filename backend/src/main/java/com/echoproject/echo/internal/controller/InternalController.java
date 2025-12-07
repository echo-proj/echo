package com.echoproject.echo.internal.controller;

import com.echoproject.echo.document.dto.ValidateDocumentAccessRequest;
import com.echoproject.echo.document.dto.ValidateDocumentAccessResponse;
import com.echoproject.echo.document.service.DocumentService;
import com.echoproject.echo.security.service.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalController {

  private final DocumentService documentService;

  @PostMapping("/validate-document-access")
  public ResponseEntity<ValidateDocumentAccessResponse> validateDocumentAccess(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody ValidateDocumentAccessRequest request) {

    boolean hasAccess =
        documentService.validateDocumentAccess(userDetails.getId(), request.getDocumentId());

    return ResponseEntity.ok(
        new ValidateDocumentAccessResponse(
            hasAccess, userDetails.getId(), userDetails.getUsername()));
  }
}
