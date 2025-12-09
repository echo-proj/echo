import { useEffect, useState } from 'react';
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
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [ydoc] = useState(() => new Y.Doc());

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const wsProvider = new WebsocketProvider(
      COLLABORATION_WS_URL,
      documentId,
      ydoc,
      {
        params: {
          token,
          documentId,
        },
      }
    );

    wsProvider.on('status', (event: { status: string }) => {
      console.log('WebSocket status:', event.status);
    });

    wsProvider.on('sync', (isSynced: boolean) => {
      console.log('Document synced:', isSynced);
    });

    setProvider(wsProvider);

    return () => {
      wsProvider?.destroy();
    };
  }, [documentId, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
    ],
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
  }, [provider]);

  if (!editor) {
    return <div className={styles.loading}>Loading editor...</div>;
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
