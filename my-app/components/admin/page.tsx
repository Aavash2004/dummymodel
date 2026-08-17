"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          "min-h-[300px] w-full px-4 py-3 outline-none prose prose-zinc max-w-none dark:prose-invert",
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
      <div className="flex flex-wrap items-center gap-1 border-b border-input bg-zinc-50 p-2 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
          className={`rounded px-3 py-1.5 text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
            editor?.isActive("bold")
              ? "bg-zinc-200 dark:bg-zinc-700"
              : ""
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
          className={`rounded px-3 py-1.5 text-sm italic hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
            editor?.isActive("italic")
              ? "bg-zinc-200 dark:bg-zinc-700"
              : ""
          }`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={!editor}
          className={`rounded px-3 py-1.5 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
            editor?.isActive("heading", { level: 2 })
              ? "bg-zinc-200 dark:bg-zinc-700"
              : ""
          }`}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={!editor}
          className={`rounded px-3 py-1.5 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
            editor?.isActive("heading", { level: 3 })
              ? "bg-zinc-200 dark:bg-zinc-700"
              : ""
          }`}
        >
          H3
        </button>

        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleBulletList().run()
          }
          disabled={!editor}
          className="rounded px-3 py-1.5 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleOrderedList().run()
          }
          disabled={!editor}
          className="rounded px-3 py-1.5 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          1. List
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          className="rounded px-3 py-1.5 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          Undo
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          className="rounded px-3 py-1.5 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          Redo
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}