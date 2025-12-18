package com.echoproject.echo.integration.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.echoproject.echo.common.exception.NotFoundException;
import com.echoproject.echo.notification.dto.NotificationResponse;
import com.echoproject.echo.notification.models.Notification;
import com.echoproject.echo.notification.models.NotificationType;
import com.echoproject.echo.notification.repository.NotificationRepository;
import com.echoproject.echo.notification.service.NotificationService;
import com.echoproject.echo.user.models.User;
import com.echoproject.echo.user.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class NotificationServiceIntegrationTest {

  @Autowired private NotificationService notificationService;

  @Autowired private NotificationRepository notificationRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  private User recipient;
  private User actorA;
  private User actorB;

  @BeforeEach
  void setUp() {
    notificationRepository.deleteAll();
    userRepository.deleteAll();

    recipient = new User("recipient", passwordEncoder.encode("password"));
    actorA = new User("actorA", passwordEncoder.encode("password"));
    actorB = new User("actorB", passwordEncoder.encode("password"));
    userRepository.save(recipient);
    userRepository.save(actorA);
    userRepository.save(actorB);
  }

  @Test
  void createNotification_shouldPersistWithExpectedFields() {
    UUID docId = UUID.randomUUID();

    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_ADDED, docId, actorA.getId());

    List<Notification> list = notificationRepository.findAll();
    assertThat(list).hasSize(1);
    Notification n = list.get(0);
    assertThat(n.getRecipient().getId()).isEqualTo(recipient.getId());
    assertThat(n.getType()).isEqualTo(NotificationType.COLLABORATOR_ADDED);
    assertThat(n.getDocumentId()).isEqualTo(docId);
    assertThat(n.getActor().getId()).isEqualTo(actorA.getId());
    assertThat(n.isRead()).isFalse();
    assertThat(n.getCreatedAt()).isNotNull();
    assertThat(n.getUpdatedAt()).isNotNull();
  }

  @Test
  void getUserNotifications_shouldReturnResponsesOrderedDesc() throws InterruptedException {
    UUID doc1 = UUID.randomUUID();
    UUID doc2 = UUID.randomUUID();

    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_ADDED, doc1, actorA.getId());
    // Ensure a different createdAt ordering (sleep to cross timestamp granularity)
    Thread.sleep(50);
    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_REMOVED, doc2, actorB.getId());

    List<NotificationResponse> responses = notificationService.getUserNotifications(recipient.getId());
    assertThat(responses).hasSize(2);
    // Newest first
    assertThat(responses.get(0).getDocumentId()).isEqualTo(doc2);
    assertThat(responses.get(0).getType()).isEqualTo(NotificationType.COLLABORATOR_REMOVED);
    assertThat(responses.get(0).getActorUsername()).isEqualTo("actorB");
    assertThat(responses.get(1).getDocumentId()).isEqualTo(doc1);
    assertThat(responses.get(1).getType()).isEqualTo(NotificationType.COLLABORATOR_ADDED);
    assertThat(responses.get(1).getActorUsername()).isEqualTo("actorA");
  }

  @Test
  void getUnreadCount_shouldReturnCorrectNumber() {
    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_ADDED, UUID.randomUUID(), actorA.getId());
    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_REMOVED, UUID.randomUUID(), actorB.getId());

    long unread = notificationService.getUnreadCount(recipient.getId());
    assertThat(unread).isEqualTo(2);
  }

  @Test
  void markAsRead_shouldMarkOnlyWhenRecipientMatches() {
    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_ADDED, UUID.randomUUID(), actorA.getId());
    Notification n = notificationRepository.findAll().get(0);

    notificationService.markAsRead(recipient.getId(), n.getId());

    Notification updated = notificationRepository.findById(n.getId()).orElseThrow();
    assertThat(updated.isRead()).isTrue();
  }

  @Test
  void markAsRead_shouldThrowWhenRecipientDoesNotMatch() {
    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_ADDED, UUID.randomUUID(), actorA.getId());
    Notification n = notificationRepository.findAll().get(0);

    assertThrows(
        NotFoundException.class, () -> notificationService.markAsRead(actorA.getId(), n.getId()));
  }

  @Test
  void markAllAsRead_shouldMarkAllForRecipient() {
    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_ADDED, UUID.randomUUID(), actorA.getId());
    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_REMOVED, UUID.randomUUID(), actorB.getId());

    notificationService.markAllAsRead(recipient.getId());

    List<Notification> list = notificationRepository.findAll();
    assertThat(list).hasSize(2);
    assertThat(list).allMatch(Notification::isRead);
  }

  @Test
  void deleteNotification_shouldDeleteOnlyWhenRecipientMatches() {
    notificationService.createNotification(
        recipient.getId(), NotificationType.COLLABORATOR_ADDED, UUID.randomUUID(), actorA.getId());
    Notification n = notificationRepository.findAll().get(0);

    // Wrong user cannot delete
    assertThrows(
        NotFoundException.class, () -> notificationService.deleteNotification(actorA.getId(), n.getId()));

    // Correct recipient deletes successfully
    notificationService.deleteNotification(recipient.getId(), n.getId());
    assertThat(notificationRepository.findById(n.getId())).isEmpty();
  }
}
