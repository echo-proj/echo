export type NotificationType = 'COLLABORATOR_ADDED' | 'COLLABORATOR_REMOVED';

export interface Notification {
  id: string;
  type: NotificationType;
  documentId: string;
  actorUsername: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
