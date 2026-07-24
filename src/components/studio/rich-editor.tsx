import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Quote, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichEditor({ content, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "JARVIS is ready. Type '/' for commands or start writing...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] text-jarvis-text-primary text-lg leading-relaxed font-sans placeholder:text-jarvis-text-muted/50",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes if editor exists (e.g. AI rewrites)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-jarvis-bg-deepest/50 rounded-xl border border-jarvis-border/30 overflow-hidden shadow-inner relative group">
      
      {/* Editor Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-jarvis-bg-panel/80 border-b border-jarvis-border/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0 right-0 z-10">
        <ToolbarButton 
          icon={Bold} 
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        />
        <ToolbarButton 
          icon={Italic} 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        />
        <div className="w-[1px] h-4 bg-jarvis-border/50 mx-1" />
        <ToolbarButton 
          icon={List} 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        />
        <ToolbarButton 
          icon={ListOrdered} 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        />
        <div className="w-[1px] h-4 bg-jarvis-border/50 mx-1" />
        <ToolbarButton 
          icon={Quote} 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        />
        <ToolbarButton 
          icon={Code} 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-8 pt-16">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({ icon: Icon, onClick, active }: { icon: React.ElementType, onClick: () => void, active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        active ? "bg-jarvis-glow-primary/20 text-jarvis-glow-primary" : "text-jarvis-text-secondary hover:text-jarvis-text-primary hover:bg-white/5"
      )}
    >
      <Icon size={16} />
    </button>
  );
}
