import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { notificationsApi } from '@/lib/api/notifications';
import { authStorage } from '@/lib/auth';
import { COLLABORATION_WS_URL } from '@/lib/env';
import { toast } from 'sonner';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
};

let globalWs: WebSocket | null = null;
let globalConnecting = false;
let lastDocUpdateToastAt = 0;

export const useNotificationWebSocket = () => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;

    if (globalWs || globalConnecting) return;

    const connect = () => {
      if (globalWs || globalConnecting) return;
      globalConnecting = true;
      const wsUrl = `${COLLABORATION_WS_URL}/notifications?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        globalConnecting = false;

      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'DOCUMENT_LIST_UPDATE') {
          queryClient.invalidateQueries({ queryKey: ['documents'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
          const now = Date.now();
          if (now - lastDocUpdateToastAt > 1500) {
            toast.info('New notification', {
              description: 'Your shared documents were updated.',
            });
            lastDocUpdateToastAt = now;
          }
        }
      };

      ws.onerror = () => {};

      ws.onclose = () => {
        setIsConnected(false);
        if (globalWs === ws) globalWs = null;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      globalWs = ws;
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [queryClient]);

  return { isConnected };
};
