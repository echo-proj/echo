import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCheck, Inbox } from 'lucide-react';
import { useState } from 'react';
import { DocumentEditorDialog } from '@/components/custom/documents/DocumentEditorDialog';
import { documentsApi } from '@/lib/api/documents';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Notification } from '@/domain/notifications/type';

export function NotificationDropdown() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState<string>('');
  const [infoDescription, setInfoDescription] = useState<string>('');
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const handleOpenNotification = async (notification: Notification) => {
    setActiveNotificationId(notification.id);

    // If collaborator removed, show info and offer actions.
    if (notification.type === 'COLLABORATOR_REMOVED') {
      setInfoTitle('Access Removed');
      setInfoDescription('You no longer have access to this document.');
      setInfoOpen(true);
      return;
    }

    try {
      await documentsApi.getById(notification.documentId);
      setSelectedDocumentId(notification.documentId);
      setIsDialogOpen(true);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404) {
        setInfoTitle('Document Not Found');
        setInfoDescription('This document was deleted or no longer exists.');
      } else if (status === 403) {
        setInfoTitle('Access Denied');
        setInfoDescription('You no longer have permission to view this document.');
      } else {
        setInfoTitle('Unable to Open');
        setInfoDescription('We could not open this document. Please try again later.');
      }
      setInfoOpen(true);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-4 h-4 mt-1 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              You&#39;re all caught up!
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDelete={handleDelete}
                onNavigate={() => handleOpenNotification(notification)}
              />
            ))}
          </div>
        )}
      </div>

      <DocumentEditorDialog
        documentId={selectedDocumentId}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedDocumentId(null);
        }}
      />

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoTitle}</DialogTitle>
            <DialogDescription>{infoDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {activeNotificationId && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    markAsReadMutation.mutate(activeNotificationId);
                    setInfoOpen(false);
                  }}
                  disabled={markAsReadMutation.isPending}
                >
                  Mark as read
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteNotificationMutation.mutate(activeNotificationId);
                    setInfoOpen(false);
                  }}
                  disabled={deleteNotificationMutation.isPending}
                >
                  Delete notification
                </Button>
              </>
            )}
            <Button onClick={() => setInfoOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
