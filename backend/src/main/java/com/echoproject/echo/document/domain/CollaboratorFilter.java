package com.echoproject.echo.document.domain;

import com.echoproject.echo.user.models.User;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class CollaboratorFilter {
  public static List<User> filterAvailableCollaborators(
      List<User> users, UUID ownerId, Set<UUID> existingCollaboratorIds) {

    return users.stream()
        .filter(user -> !user.getId().equals(ownerId))
        .filter(user -> !existingCollaboratorIds.contains(user.getId()))
        .collect(Collectors.toList());
  }
}
