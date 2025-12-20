package com.echoproject.echo.document.domain;

import java.util.Set;
import java.util.UUID;

public class DocumentAccessControl {
  public static boolean isOwner(UUID userId, UUID ownerId) { return userId != null && userId.equals(ownerId); }
  public static boolean hasAccess(UUID userId, UUID ownerId, Set<UUID> collaboratorIds) { return isOwner(userId, ownerId) || (collaboratorIds != null && collaboratorIds.contains(userId)); }
}

