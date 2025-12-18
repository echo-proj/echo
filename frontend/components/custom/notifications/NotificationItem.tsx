import { Notification } from '@/domain/notifications/type';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

dayjs.extend(relativeTime);

interface NotificationItemProps {
  notification: Notification;
  onDelete: (id: string) => void;
  onNavigate?: () => void;
}

export function NotificationItem({
  notification,
  onDelete,
  onNavigate,
}: NotificationItemProps) {
  const getNotificationMessage = () => {
    switch (notification.type) {
      case 'COLLABORATOR_ADDED':
        return `${notification.actorUsername} added you as a collaborator`;
      case 'COLLABORATOR_REMOVED':
        return `${notification.actorUsername} removed you as a collaborator`;
      default:
        return 'New notification';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'COLLABORATOR_ADDED':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'COLLABORATOR_REMOVED':
        return <UserMinus className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group',
        !notification.read && 'bg-blue-50 dark:bg-blue-950/20'
      )}
      onClick={handleClick}
    >
      <div className="mt-1">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {getNotificationMessage()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {dayjs(notification.createdAt).fromNow()}
        </p>
      </div>

      {!notification.read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
      )}

      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
