package com.echoproject.echo.unit.document;

import static org.assertj.core.api.Assertions.assertThat;

import com.echoproject.echo.document.domain.CollaboratorFilter;
import com.echoproject.echo.user.models.User;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class CollaboratorFilterTest {

  @Test
  void shouldFilterOutDocumentOwner() {
    // Given
    UUID ownerId = UUID.randomUUID();
    User owner = createUser(ownerId, "owner");
    User otherUser1 = createUser(UUID.randomUUID(), "user1");
    User otherUser2 = createUser(UUID.randomUUID(), "user2");
    List<User> users = List.of(owner, otherUser1, otherUser2);
    Set<UUID> existingCollaboratorIds = Set.of();

    // When
    List<User> result = CollaboratorFilter.filterAvailableCollaborators(users, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).hasSize(2);
    assertThat(result).extracting(User::getUsername).containsExactlyInAnyOrder("user1", "user2");
    assertThat(result).doesNotContain(owner);
  }

  @Test
  void shouldFilterOutExistingCollaborators() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID collaborator1Id = UUID.randomUUID();
    UUID collaborator2Id = UUID.randomUUID();
    User user1 = createUser(collaborator1Id, "collaborator1");
    User user2 = createUser(collaborator2Id, "collaborator2");
    User user3 = createUser(UUID.randomUUID(), "user3");
    List<User> users = List.of(user1, user2, user3);
    Set<UUID> existingCollaboratorIds = Set.of(collaborator1Id, collaborator2Id);

    // When
    List<User> result = CollaboratorFilter.filterAvailableCollaborators(users, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).hasSize(1);
    assertThat(result).extracting(User::getUsername).containsExactly("user3");
  }

  @Test
  void shouldFilterOutBothOwnerAndExistingCollaborators() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID collaboratorId = UUID.randomUUID();
    User owner = createUser(ownerId, "owner");
    User collaborator = createUser(collaboratorId, "collaborator");
    User availableUser = createUser(UUID.randomUUID(), "available");
    List<User> users = List.of(owner, collaborator, availableUser);
    Set<UUID> existingCollaboratorIds = Set.of(collaboratorId);

    // When
    List<User> result = CollaboratorFilter.filterAvailableCollaborators(users, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).hasSize(1);
    assertThat(result).extracting(User::getUsername).containsExactly("available");
  }

  @Test
  void shouldReturnEmptyListWhenAllUsersAreFiltered() {
    // Given
    UUID ownerId = UUID.randomUUID();
    UUID collaboratorId = UUID.randomUUID();
    User owner = createUser(ownerId, "owner");
    User collaborator = createUser(collaboratorId, "collaborator");
    List<User> users = List.of(owner, collaborator);
    Set<UUID> existingCollaboratorIds = Set.of(collaboratorId);

    // When
    List<User> result = CollaboratorFilter.filterAvailableCollaborators(users, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).isEmpty();
  }

  @Test
  void shouldReturnAllUsersWhenNoneAreOwnerOrCollaborators() {
    // Given
    UUID ownerId = UUID.randomUUID();
    User user1 = createUser(UUID.randomUUID(), "user1");
    User user2 = createUser(UUID.randomUUID(), "user2");
    User user3 = createUser(UUID.randomUUID(), "user3");
    List<User> users = List.of(user1, user2, user3);
    Set<UUID> existingCollaboratorIds = Set.of();

    // When
    List<User> result = CollaboratorFilter.filterAvailableCollaborators(users, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).hasSize(3);
    assertThat(result).extracting(User::getUsername).containsExactlyInAnyOrder("user1", "user2", "user3");
  }

  @Test
  void shouldHandleEmptyUsersList() {
    // Given
    UUID ownerId = UUID.randomUUID();
    List<User> users = List.of();
    Set<UUID> existingCollaboratorIds = Set.of();

    // When
    List<User> result = CollaboratorFilter.filterAvailableCollaborators(users, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).isEmpty();
  }

  @Test
  void shouldHandleEmptyCollaboratorsList() {
    // Given
    UUID ownerId = UUID.randomUUID();
    User user1 = createUser(UUID.randomUUID(), "user1");
    User user2 = createUser(UUID.randomUUID(), "user2");
    List<User> users = List.of(user1, user2);
    Set<UUID> existingCollaboratorIds = Set.of();

    // When
    List<User> result = CollaboratorFilter.filterAvailableCollaborators(users, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).hasSize(2);
    assertThat(result).extracting(User::getUsername).containsExactlyInAnyOrder("user1", "user2");
  }

  @Test
  void shouldHandleLargeNumberOfCollaborators() {
    // Given
    UUID ownerId = UUID.randomUUID();
    User user1 = createUser(UUID.randomUUID(), "user1");
    User user2 = createUser(UUID.randomUUID(), "user2");
    User availableUser = createUser(UUID.randomUUID(), "available");
    List<User> users = List.of(user1, user2, availableUser);
    Set<UUID> existingCollaboratorIds = Set.of(
        user1.getId(), user2.getId(),
        UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID()
    );

    // When
    List<User> result = CollaboratorFilter.filterAvailableCollaborators(users, ownerId, existingCollaboratorIds);

    // Then
    assertThat(result).hasSize(1);
    assertThat(result).extracting(User::getUsername).containsExactly("available");
  }

  private User createUser(UUID id, String username) {
    return new User(id, username, "password", null, null, null);
  }
}
