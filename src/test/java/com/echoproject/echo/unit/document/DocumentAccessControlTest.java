package com.echoproject.echo.unit.document;

import static org.assertj.core.api.Assertions.assertThat;

import com.echoproject.echo.document.domain.DocumentAccessControl;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DocumentAccessControlTest {

  @Test
  void ownerShouldHaveAccess() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID userId = ownerId;
    Set<UUID> collaboratorIds = Set.of();

    // When
    boolean hasAccess = DocumentAccessControl.hasAccess(userId, ownerId, collaboratorIds);

    // Then
    assertThat(hasAccess).isTrue();
  }

  @Test
  void collaboratorShouldHaveAccess() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID collaboratorId = UUID.randomUUID();
    UUID userId = collaboratorId;
    Set<UUID> collaboratorIds = Set.of(collaboratorId);

    // When
    boolean hasAccess = DocumentAccessControl.hasAccess(userId, ownerId, collaboratorIds);

    // Then
    assertThat(hasAccess).isTrue();
  }

  @Test
  void nonOwnerNonCollaboratorShouldNotHaveAccess() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    Set<UUID> collaboratorIds = Set.of(UUID.randomUUID(), UUID.randomUUID());

    // When
    boolean hasAccess = DocumentAccessControl.hasAccess(userId, ownerId, collaboratorIds);

    // Then
    assertThat(hasAccess).isFalse();
  }

  @Test
  void shouldHandleEmptyCollaboratorsList() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    Set<UUID> collaboratorIds = Set.of();

    // When
    boolean hasAccess = DocumentAccessControl.hasAccess(userId, ownerId, collaboratorIds);

    // Then
    assertThat(hasAccess).isFalse();
  }

  @Test
  void shouldHandleMultipleCollaborators() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID collaborator1 = UUID.randomUUID();
    UUID collaborator2 = UUID.randomUUID();
    UUID collaborator3 = UUID.randomUUID();
    UUID userId = collaborator2;
    Set<UUID> collaboratorIds = Set.of(collaborator1, collaborator2, collaborator3);

    // When
    boolean hasAccess = DocumentAccessControl.hasAccess(userId, ownerId, collaboratorIds);

    // Then
    assertThat(hasAccess).isTrue();
  }

  @Test
  void isOwner_shouldReturnTrueForOwner() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID userId = ownerId;

    // When
    boolean result = DocumentAccessControl.isOwner(userId, ownerId);

    // Then
    assertThat(result).isTrue();
  }

  @Test
  void isOwner_shouldReturnFalseForNonOwner() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();

    // When
    boolean result = DocumentAccessControl.isOwner(userId, ownerId);

    // Then
    assertThat(result).isFalse();
  }

  @Test
  void canAddCollaborator_shouldReturnTrueForValidCollaborator() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID collaboratorId = UUID.randomUUID();
    Set<UUID> existingCollaboratorIds = Set.of(UUID.randomUUID());

    // When
    boolean result =
        DocumentAccessControl.canAddCollaborator(collaboratorId, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).isTrue();
  }

  @Test
  void canAddCollaborator_shouldReturnFalseWhenCollaboratorIsOwner() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID collaboratorId = ownerId;
    Set<UUID> existingCollaboratorIds = Set.of();

    // When
    boolean result =
        DocumentAccessControl.canAddCollaborator(collaboratorId, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).isFalse();
  }

  @Test
  void canAddCollaborator_shouldReturnFalseWhenAlreadyCollaborator() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID collaboratorId = UUID.randomUUID();
    Set<UUID> existingCollaboratorIds = Set.of(collaboratorId, UUID.randomUUID());

    // When
    boolean result =
        DocumentAccessControl.canAddCollaborator(collaboratorId, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).isFalse();
  }

  @Test
  void isCollaborator_shouldReturnTrueWhenUserIsCollaborator() {
    // Given
    UUID collaboratorId = UUID.randomUUID();
    Set<UUID> collaboratorIds = Set.of(collaboratorId, UUID.randomUUID());

    // When
    boolean result = DocumentAccessControl.isCollaborator(collaboratorId, collaboratorIds);

    // Then
    assertThat(result).isTrue();
  }

  @Test
  void isCollaborator_shouldReturnFalseWhenUserIsNotCollaborator() {
    // Given
    UUID collaboratorId = UUID.randomUUID();
    Set<UUID> collaboratorIds = Set.of(UUID.randomUUID(), UUID.randomUUID());

    // When
    boolean result = DocumentAccessControl.isCollaborator(collaboratorId, collaboratorIds);

    // Then
    assertThat(result).isFalse();
  }
}
