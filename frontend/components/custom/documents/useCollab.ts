import { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { authStorage } from '@/lib/auth';
import { AwarenessState, ConnectionStatus, UserState } from '@/domain/documents/type';
import { COLLABORATION_WS_URL } from '@/lib/env';

function getUserColor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 60%)`;
}

export function useCollab(documentId: string, sessionId: number) {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [synced, setSynced] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<UserState[]>([]);
  const [isRemoteRestoring, setIsRemoteRestoring] = useState(false);

  const auth = useMemo(() => {
    return {
      token: authStorage.getToken() || '',
      username: authStorage.getUsername() || 'Anonymous',
    };
  }, [documentId, sessionId]);

  useEffect(() => {
    const doc = new Y.Doc();
    const wsProvider = new WebsocketProvider(COLLABORATION_WS_URL, documentId, doc, {
      params: { token: auth.token, documentId },
    });

    wsProvider.awareness.setLocalStateField('user', {
      name: auth.username,
      color: getUserColor(auth.username),
    });

    const handleAwarenessUpdate = () => {
      const states = wsProvider.awareness.getStates() as Map<number, AwarenessState>;
      const users: UserState[] = [];
      let restoringFound = false;

      states.forEach((state) => {
        if (state?.user) users.push(state.user);
        if (state?.restoring?.active) restoringFound = true;
      });

      setActiveUsers(users);
      setIsRemoteRestoring(restoringFound);
    };

    const handleSync = (isSynced: boolean) => {
      setSynced(isSynced);
      if (isSynced) {
        try {
          const current = (wsProvider.awareness.getLocalState() || {}) as AwarenessState;
          if (current.restoring) {
            const { restoring, ...rest } = current;
            wsProvider.awareness.setLocalState(rest as AwarenessState);
          }
        } catch {}
      }
    };

    const handleStatus = (event: ConnectionStatus) => {
      if (event.status === 'connected') {
        setConnected(true);
      } else if (event.status === 'connecting') {
        setConnected(false);
      } else {
        setConnected(false);
        setSynced(false);
      }
    };

    wsProvider.on('sync', handleSync);
    wsProvider.on('status', handleStatus);
    wsProvider.on('connection-close', () => { setConnected(false); setSynced(false); });
    wsProvider.awareness.on('change', handleAwarenessUpdate);

    const init = window.setTimeout(handleAwarenessUpdate, 0);

    setProvider(wsProvider);
    setYdoc(doc);

    return () => {
      clearTimeout(init);
      wsProvider.off('sync', handleSync);
      wsProvider.off('status', handleStatus);
      wsProvider.awareness.off('change', handleAwarenessUpdate);
      try { wsProvider.destroy(); } catch {}
      try { doc.destroy(); } catch {}
    };
  }, [documentId, sessionId, auth.token, auth.username]);

  return { provider, ydoc, synced, connected, activeUsers, isRemoteRestoring };
}
