package com.echoproject.echo.document.domain;

import java.util.Set;
import java.util.UUID;

public class DocumentAccessControl {
  public static boolean isOwner(UUID userId, UUID ownerId) { return userId != null && userId.equals(ownerId); }
  public static boolean isCollaborator(UUID userId, Set<UUID> collaboratorIds) { return collaboratorIds != null && collaboratorIds.contains(userId); }
  public static boolean hasAccess(UUID userId, UUID ownerId, Set<UUID> collaboratorIds) { return isOwner(userId, ownerId) || isCollaborator(userId, collaboratorIds); }
  public static boolean canAddCollaborator(UUID candidateId, UUID ownerId, Set<UUID> collaboratorIds) { return !candidateId.equals(ownerId) && !collaboratorIds.contains(candidateId); }
}

