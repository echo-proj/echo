package com.echoproject.echo.document.domain;

import java.util.Set;
import java.util.UUID;

public class DocumentAccessControl {

  public static boolean hasAccess(UUID userId, UUID ownerId, Set<UUID> collaboratorIds) {
    return userId.equals(ownerId) || collaboratorIds.contains(userId);
  }

  public static boolean isOwner(UUID userId, UUID ownerId) {
    return userId.equals(ownerId);
  }

  public static boolean canAddCollaborator(
      UUID collaboratorId, UUID ownerId, Set<UUID> existingCollaboratorIds) {
    if (collaboratorId.equals(ownerId)) {
      return false;
    }

    return !existingCollaboratorIds.contains(collaboratorId);
  }

  public static boolean isCollaborator(UUID collaboratorId, Set<UUID> collaboratorIds) {
    return collaboratorIds.contains(collaboratorId);
  }
}
