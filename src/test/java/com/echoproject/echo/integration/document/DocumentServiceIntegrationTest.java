package com.echoproject.echo.integration.document;

import static org.assertj.core.api.Assertions.assertThat;

import com.echoproject.echo.document.dto.AddCollaboratorRequest;
import com.echoproject.echo.document.dto.CreateDocumentRequest;
import com.echoproject.echo.document.dto.DocumentResponse;
import com.echoproject.echo.document.models.Document;
import com.echoproject.echo.document.models.DocumentCollaborator;
import com.echoproject.echo.document.repository.DocumentCollaboratorRepository;
import com.echoproject.echo.document.repository.DocumentRepository;
import com.echoproject.echo.document.service.DocumentService;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.repository.UserRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class DocumentServiceIntegrationTest {

  @Autowired private DocumentService documentService;

  @Autowired private DocumentRepository documentRepository;

  @Autowired private DocumentCollaboratorRepository collaboratorRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  private User owner;
  private User collaborator;

  @BeforeEach
  void setUp() {
    collaboratorRepository.deleteAll();
    documentRepository.deleteAll();
    userRepository.deleteAll();

    owner = new User("owner", passwordEncoder.encode("password"));
    userRepository.save(owner);

    collaborator = new User("collaborator", passwordEncoder.encode("password"));
    userRepository.save(collaborator);
  }

  @Test
  void createDocument_shouldCreateSuccessfully() {
    // Given
    CreateDocumentRequest request = new CreateDocumentRequest("Test Document");

    // When
    DocumentResponse response = documentService.createDocument(owner.getId(), request);

    // Then
    assertThat(response.getTitle()).isEqualTo("Test Document");
    assertThat(response.getOwnerUsername()).isEqualTo("owner");
    assertThat(response.getId()).isNotNull();
  }

  @Test
  void getUserDocuments_shouldReturnAllAccessibleDocuments() {
    // Given
    Document doc1 = new Document("Doc 1", owner);
    Document doc2 = new Document("Doc 2", owner);
    documentRepository.save(doc1);
    documentRepository.save(doc2);

    // When
    List<DocumentResponse> documents = documentService.getUserDocuments(owner.getId());

    // Then
    assertThat(documents).hasSize(2);
    assertThat(documents).extracting(DocumentResponse::getTitle).containsExactlyInAnyOrder("Doc 1", "Doc 2");
  }

  @Test
  void getDocument_shouldReturnDocumentWhenUserHasAccess() {
    // Given
    Document doc = new Document("Test Doc", owner);
    documentRepository.save(doc);

    // When
    DocumentResponse retrieved = documentService.getDocument(owner.getId(), doc.getId());

    // Then
    assertThat(retrieved.getId()).isEqualTo(doc.getId());
    assertThat(retrieved.getTitle()).isEqualTo("Test Doc");
  }

  @Test
  void deleteDocument_shouldDeleteSuccessfully() {
    // Given
    Document doc = new Document("Test Doc", owner);
    documentRepository.save(doc);

    // When
    documentService.deleteDocument(owner.getId(), doc.getId());

    // Then
    assertThat(documentRepository.findById(doc.getId())).isEmpty();
  }

  @Test
  void addCollaborator_shouldAddSuccessfully() {
    // Given
    Document doc = new Document("Test Doc", owner);
    documentRepository.save(doc);
    AddCollaboratorRequest request = new AddCollaboratorRequest("collaborator");

    // When
    documentService.addCollaborator(owner.getId(), doc.getId(), request);

    // Then
    assertThat(collaboratorRepository.existsByDocumentIdAndUserId(doc.getId(), collaborator.getId())).isTrue();
  }

  @Test
  void removeCollaborator_shouldRemoveSuccessfully() {
    // Given
    Document doc = new Document("Test Doc", owner);
    documentRepository.save(doc);
    DocumentCollaborator docCollaborator = new DocumentCollaborator(doc, collaborator);
    collaboratorRepository.save(docCollaborator);

    // When
    documentService.removeCollaborator(owner.getId(), doc.getId(), collaborator.getId());

    // Then
    assertThat(collaboratorRepository.existsByDocumentIdAndUserId(doc.getId(), collaborator.getId())).isFalse();
  }
}
