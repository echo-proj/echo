package com.echoproject.echo.user.repository;

import com.echoproject.echo.user.models.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByUsername(String username);

  boolean existsByUsername(String username);

  @Query(
      "SELECT u FROM User u JOIN FETCH u.profile WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY"
          + " u.username")
  List<User> searchByUsername(@Param("query") String query);
}
