package com.echoproject.echo.document.domain;

import com.echoproject.echo.user.models.User;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class CollaboratorFilter {
  public static List<User> filterAvailableCollaborators(List<User> users, UUID ownerId, Set<UUID> existing) {
    return users.stream().filter(u -> !u.getId().equals(ownerId) && !existing.contains(u.getId())).toList();
  }
}

