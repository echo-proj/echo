package com.echoproject.echo.integration.document;

import static org.assertj.core.api.Assertions.assertThat;

import com.echoproject.echo.document.dto.CreateVersionRequest;
import com.echoproject.echo.document.dto.VersionContentResponse;
import com.echoproject.echo.document.dto.VersionResponse;
import com.echoproject.echo.document.models.Document;
import com.echoproject.echo.document.models.DocumentContent;
import com.echoproject.echo.document.repository.DocumentCollaboratorRepository;
import com.echoproject.echo.document.repository.DocumentContentRepository;
import com.echoproject.echo.document.repository.DocumentRepository;
import com.echoproject.echo.document.repository.DocumentVersionRepository;
import com.echoproject.echo.document.service.DocumentVersionService;
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
class DocumentVersionServiceIntegrationTest {

  @Autowired private DocumentVersionService versionService;

  @Autowired private DocumentVersionRepository versionRepository;

  @Autowired private DocumentRepository documentRepository;

  @Autowired private DocumentContentRepository contentRepository;

  @Autowired private DocumentCollaboratorRepository collaboratorRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  private User owner;

  @BeforeEach
  void setUp() {
    versionRepository.deleteAll();
    contentRepository.deleteAll();
    collaboratorRepository.deleteAll();
    documentRepository.deleteAll();
    userRepository.deleteAll();

    owner = new User("owner", passwordEncoder.encode("password"));
    userRepository.save(owner);
  }

  @Test
  void createVersion_shouldCreateSuccessfully() {
    // Given
    Document doc = new Document("Test Doc", owner);
    documentRepository.save(doc);

    byte[] testState = "test content".getBytes();
    DocumentContent content = new DocumentContent(doc);
    content.setState(testState);
    contentRepository.save(content);

    CreateVersionRequest request = new CreateVersionRequest("Version 1");

    // When
    VersionResponse response = versionService.createVersion(owner.getId(), doc.getId(), request);

    // Then
    assertThat(response.getVersionNumber()).isEqualTo(1);
    assertThat(response.getLabel()).isEqualTo("Version 1");
    assertThat(response.getCreatedByUsername()).isEqualTo("owner");
    assertThat(response.getDocumentId()).isEqualTo(doc.getId());
  }

  @Test
  void getDocumentVersions_shouldReturnAllVersions() {
    // Given
    Document doc = new Document("Test Doc", owner);
    documentRepository.save(doc);

    byte[] testState = "test content".getBytes();
    DocumentContent content = new DocumentContent(doc);
    content.setState(testState);
    contentRepository.save(content);

    versionService.createVersion(owner.getId(), doc.getId(), new CreateVersionRequest("Version 1"));
    versionService.createVersion(owner.getId(), doc.getId(), new CreateVersionRequest("Version 2"));

    // When
    List<VersionResponse> versions = versionService.getDocumentVersions(owner.getId(), doc.getId());

    // Then
    assertThat(versions).hasSize(2);
    assertThat(versions.get(0).getVersionNumber()).isEqualTo(2);
    assertThat(versions.get(1).getVersionNumber()).isEqualTo(1);
  }

  @Test
  void getVersionContent_shouldReturnContentSuccessfully() {
    // Given
    Document doc = new Document("Test Doc", owner);
    documentRepository.save(doc);

    byte[] testState = "test content".getBytes();
    DocumentContent content = new DocumentContent(doc);
    content.setState(testState);
    contentRepository.save(content);

    VersionResponse createdVersion = versionService.createVersion(owner.getId(), doc.getId(), new CreateVersionRequest("Version 1"));

    // When
    VersionContentResponse response = versionService.getVersionContent(owner.getId(), doc.getId(), createdVersion.getId());

    // Then
    assertThat(response.getState()).isEqualTo(testState);
    assertThat(response.getVersionNumber()).isEqualTo(1);
  }

  @Test
  void restoreVersion_shouldRestoreContentSuccessfully() {
    // Given
    Document doc = new Document("Test Doc", owner);
    documentRepository.save(doc);

    byte[] originalState = "original content".getBytes();
    DocumentContent content = new DocumentContent(doc);
    content.setState(originalState);
    contentRepository.save(content);

    VersionResponse version = versionService.createVersion(owner.getId(), doc.getId(), new CreateVersionRequest("Version 1"));

    byte[] newState = "new content".getBytes();
    content.setState(newState);
    contentRepository.save(content);

    // When
    versionService.restoreVersion(owner.getId(), doc.getId(), version.getId());

    // Then
    DocumentContent restoredContent = contentRepository.findById(doc.getId()).orElseThrow();
    assertThat(restoredContent.getState()).isEqualTo(originalState);
  }

  @Test
  void deleteVersion_shouldDeleteSuccessfully() {
    // Given
    Document doc = new Document("Test Doc", owner);
    documentRepository.save(doc);

    byte[] testState = "test content".getBytes();
    DocumentContent content = new DocumentContent(doc);
    content.setState(testState);
    contentRepository.save(content);

    VersionResponse version = versionService.createVersion(owner.getId(), doc.getId(), new CreateVersionRequest("Version 1"));

    // When
    versionService.deleteVersion(owner.getId(), doc.getId(), version.getId());

    // Then
    assertThat(versionRepository.findById(version.getId())).isEmpty();
  }
}
