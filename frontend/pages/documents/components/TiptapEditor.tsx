import {useEffect, useMemo, useState} from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import {WebsocketProvider} from 'y-websocket';
import styles from './TiptapEditor.module.scss';
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

const COLLABORATION_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

function getUserColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export function TiptapEditor({ documentId, onActiveUsersChange }: TiptapEditorProps) {
  const [synced, setSynced] = useState(false);
  const [sessionId, setSessionId] = useState(0);

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
      const states = provider.awareness.getStates();
      const users: Array<{ name: string; color: string }> = [];

      states.forEach((state: AwarenessUserState) => {
        if (state.user) {
          users.push({
            name: state.user.name,
            color: state.user.color,
          });
        }
      });

      onActiveUsersChange?.(users);
    };

    provider.awareness.on('change', updateUsers);
    updateUsers();

    return () => {
      provider.awareness.off('change', updateUsers);
    };
  }, [provider, onActiveUsersChange]);

  useEffect(() => {
    const handleSync = (isSynced: boolean) => {
      if (isSynced) setSynced(true);
    };

    provider.on('sync', handleSync);
    const handleClose = () => {
      setSynced(false);
      setSessionId((v) => v + 1);
    };
    provider.on('connection-close', handleClose as any);

    return () => {
      provider.off('connection-close', handleClose as any);
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
    editable: synced,
  }, [provider, synced, ydoc]);

  if (!editor) {
    return <div className={styles.loading}>Loading editor...</div>;
  }

  if (!synced) {
    return <div className={styles.loading}>Syncing document...</div>;
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? styles.active : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? styles.active : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? styles.active : ''}
        >
          Strike
        </button>
        <div className={styles.divider} />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? styles.active : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? styles.active : ''}
        >
          H3
        </button>
        <div className={styles.divider} />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? styles.active : ''}
        >
          Bullet List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? styles.active : ''}
        >
          Numbered List
        </button>
        <div className={styles.divider} />
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? styles.active : ''}
        >
          Quote
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          Divider
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
