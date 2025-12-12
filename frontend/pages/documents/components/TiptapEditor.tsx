import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import styles from './TiptapEditor.module.scss';

interface TiptapEditorProps {
  documentId: string;
}

const COLLABORATION_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export function TiptapEditor({ documentId }: TiptapEditorProps) {
  const [synced, setSynced] = useState(false);
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const CLIENT_SAVE_DEBOUNCE_MS = 600;

  const [{ ydoc, provider }] = useState(() => {
    const doc = new Y.Doc();
    const token = localStorage.getItem('auth_token');

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

    return { ydoc: doc, provider: wsProvider };
  });

  useEffect(() => {
    provider.on('sync', () => setSynced(true));

    const updateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin === provider && !synced) setSynced(true);
      if (origin !== provider) {
        if (saveTimer) clearTimeout(saveTimer);
        const t = setTimeout(async () => {
          try {
            const state = Y.encodeStateAsUpdate(ydoc);
            await axiosInstance.post(
              `/api/documents/${documentId}/content`,
              state,
              { headers: { 'Content-Type': 'application/octet-stream' }, maxBodyLength: Infinity, maxContentLength: Infinity }
            );
          } catch {
            // ignore transient errors
          }
        }, CLIENT_SAVE_DEBOUNCE_MS);
        setSaveTimer(t);
      }
    };
    ydoc.on('update', updateHandler);

    return () => {
      try {
        if (saveTimer) clearTimeout(saveTimer);
        const state = Y.encodeStateAsUpdate(ydoc);
        void axiosInstance.post(
          `/api/documents/${documentId}/content`,
          state,
          { headers: { 'Content-Type': 'application/octet-stream' }, maxBodyLength: Infinity, maxContentLength: Infinity }
        ).catch(() => {});
      } catch {}
      ydoc.off('update', updateHandler);
      provider?.destroy();
    };
  }, [documentId, ydoc, provider, synced, saveTimer]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: 'default',
      }),
    ],
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
    editable: synced,
  }, [provider, synced]);

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
