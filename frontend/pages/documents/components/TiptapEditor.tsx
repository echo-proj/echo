import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import styles from './TiptapEditor.module.scss';

interface TiptapEditorProps {
  documentId: string;
}

export function TiptapEditor({ documentId }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '<p>Start typing your document here...</p>',
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
  });

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
