import {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import {WebsocketProvider} from 'y-websocket';
import styles from './TiptapEditor.module.scss';
import { Skeleton } from '@/components/ui/skeleton';
import {authStorage} from '@/lib/auth';

interface TiptapEditorProps {
  documentId: string;
  onActiveUsersChange?: (users: Array<{ name: string; color: string }>) => void;
}

interface AwarenessUserState {
  user?: {
    name: string;
    color: string;
  };
}

type RestoringState = { active: boolean; ts: number };
type EditorAwarenessState = AwarenessUserState & { restoring?: RestoringState };
type ConnectionStatus = { status: 'connected' | 'connecting' | 'disconnected' };

interface WSProviderLike {
  on(event: 'sync', cb: (isSynced: boolean) => void): void;
  off(event: 'sync', cb: (isSynced: boolean) => void): void;
  on(event: 'connection-close', cb: () => void): void;
  off(event: 'connection-close', cb: () => void): void;
  on(event: 'status', cb: (e: ConnectionStatus) => void): void;
  off(event: 'status', cb: (e: ConnectionStatus) => void): void;
}

const COLLABORATION_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

function getUserColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export type TiptapEditorHandle = {
  startRestore: () => void;
};

export const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(function TiptapEditor(
  { documentId, onActiveUsersChange },
  ref
) {
  const [synced, setSynced] = useState(false);
  const [sessionId, setSessionId] = useState(0);
  const [restoringOverlay, setRestoringOverlay] = useState(false);
  const initiatorRef = useRef(false);
  const overlayUntilRef = useRef<number | null>(null);
  const overlayTimeoutRef = useRef<number | undefined>(undefined);
  const [overlayTick, setOverlayTick] = useState(0);
  const overlayHoldRef = useRef<boolean>(false);

  const { ydoc, provider } = useMemo(() => {
    const doc = new Y.Doc();
    const token = authStorage.getToken();
    const username = authStorage.getUsername() || 'Anonymous';

    const wsProvider = new WebsocketProvider(
      COLLABORATION_WS_URL,
      documentId,
      doc,
      {
        params: {
          token: token || '',
          documentId,
        },
      }
    );

    wsProvider.awareness.setLocalStateField('user', {
      name: username,
      color: getUserColor(username),
    });

    return { ydoc: doc, provider: wsProvider };
  }, [documentId, sessionId]);

  useEffect(() => {
    const updateUsers = () => {
      const states = provider.awareness.getStates() as Map<number, EditorAwarenessState>;
      const users: Array<{ name: string; color: string }> = [];
      let anyRestoring = false;

      states.forEach((state) => {
        if (state?.restoring?.active) anyRestoring = true;
        const u = state.user;
        if (u) users.push({ name: u.name, color: u.color });
      });

      setRestoringOverlay(anyRestoring);
      onActiveUsersChange?.(users);
    };

    provider.awareness.on('change', updateUsers);
    const init = window.setTimeout(updateUsers, 0);

    return () => {
      clearTimeout(init);
      provider.awareness.off('change', updateUsers);
    };
  }, [provider, onActiveUsersChange]);

  useEffect(() => {
    const handleSync = (isSynced: boolean) => {
      if (isSynced) {
        setSynced(true)
        setRestoringOverlay(false);

        const current = (provider.awareness.getLocalState() || {}) as EditorAwarenessState;
        if (current.restoring) {
          const { restoring, ...rest } = current;
          provider.awareness.setLocalState(rest as EditorAwarenessState);
        }

        initiatorRef.current = false;
      }
    };

    const providerLike = provider as unknown as WSProviderLike;
    providerLike.on('sync', handleSync);

    const handleClose = () => {
      setSynced(false);
      setSessionId((v) => v + 1);
    };

    providerLike.on('connection-close', handleClose);

    const handleStatus = (e: ConnectionStatus) => {
      if (e.status === 'disconnected') {
        setSynced(false);
      }
    };
    providerLike.on('status', handleStatus);

    return () => {
      providerLike.off('sync', handleSync);
      providerLike.off('connection-close', handleClose);
      providerLike.off('status', handleStatus);
      provider?.destroy();
    };
  }, [provider]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: 'prosemirror',
      }),
    ],
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
    editable: synced && !restoringOverlay,
  }, [provider, synced, ydoc]);

  useImperativeHandle(ref, () => ({
    startRestore: () => {
      const current = (provider.awareness.getLocalState() || {}) as EditorAwarenessState;
      provider.awareness.setLocalState({ ...current, restoring: { active: true, ts: Date.now() } });
      initiatorRef.current = true;
      setRestoringOverlay(true);
      const BROADCAST_DELAY = 120;
      const RECONNECT_DELAY = 900;
      setTimeout(() => {
        try { provider.destroy(); } catch {}
        try { ydoc.destroy(); } catch {}
        setTimeout(() => {
          setSessionId((v) => v + 1);
        }, RECONNECT_DELAY);
      }, BROADCAST_DELAY);
    },
  }));

  const showOverlay = restoringOverlay || !synced || !editor;
  const MIN_OVERLAY_MS = 350;
  const showOverlayRef = useRef<boolean>(showOverlay);
  useEffect(() => { showOverlayRef.current = showOverlay; }, [showOverlay]);

  useEffect(() => {
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
      overlayTimeoutRef.current = undefined;
    }

    if (showOverlay) {
      overlayUntilRef.current = Date.now() + MIN_OVERLAY_MS;
      overlayHoldRef.current = true;
      overlayTimeoutRef.current = window.setTimeout(() => {
        if (!showOverlayRef.current) {
          overlayHoldRef.current = false;
          setOverlayTick((v) => v + 1);
        }
        overlayTimeoutRef.current = undefined;
      }, MIN_OVERLAY_MS);
    } else {
      const remain = Math.max(0, (overlayUntilRef.current ?? 0) - Date.now());
      if (remain > 0) {
        overlayHoldRef.current = true;
        overlayTimeoutRef.current = window.setTimeout(() => {
          overlayHoldRef.current = false;
          setOverlayTick((v) => v + 1);
          overlayTimeoutRef.current = undefined;
        }, remain);
      } else {
        overlayTimeoutRef.current = window.setTimeout(() => {
          overlayHoldRef.current = false;
          setOverlayTick((v) => v + 1);
          overlayTimeoutRef.current = undefined;
        }, 0);
      }
    }

    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = undefined;
      }
    };
  }, [showOverlay, MIN_OVERLAY_MS]);

  void overlayTick;
  const overlayVisible = showOverlay || overlayHoldRef.current;
  const toolbarDisabled = overlayVisible || !editor;

  return (
    <div className={styles.editorContainer}>
      {overlayVisible && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8, padding: 16, background: 'rgba(255,255,255,0.98)' }}>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
      <div className={styles.toolbar}>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? styles.active : ''}
          disabled={toolbarDisabled}
        >
          Bold
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? styles.active : ''}
          disabled={toolbarDisabled}
        >
          Italic
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={editor?.isActive('strike') ? styles.active : ''}
          disabled={toolbarDisabled}
        >
          Strike
        </button>
        <div className={styles.divider} />
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor?.isActive('heading', { level: 1 }) ? styles.active : ''}
          disabled={toolbarDisabled}
        >
          H1
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor?.isActive('heading', { level: 2 }) ? styles.active : ''}
          disabled={toolbarDisabled}
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor?.isActive('heading', { level: 3 }) ? styles.active : ''}
          disabled={toolbarDisabled}
        >
          H3
        </button>
        <div className={styles.divider} />
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive('bulletList') ? styles.active : ''}
          disabled={toolbarDisabled}
        >
          Bullet List
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive('orderedList') ? styles.active : ''}
          disabled={toolbarDisabled}
        >
          Numbered List
        </button>
        <div className={styles.divider} />
        <button
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={editor?.isActive('blockquote') ? styles.active : ''}
          disabled={toolbarDisabled}
        >
          Quote
        </button>
        <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} disabled={toolbarDisabled}>
          Divider
        </button>
      </div>
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className={styles.editor} />
      )}
    </div>
  );
});
