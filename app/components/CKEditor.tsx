"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Box,
  Button,
  Divider,
  Paper,
  Toolbar,
  Tooltip,
  alpha,
  styled,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Title,
  InsertLink,
  Image as ImageIcon,
  FormatClear,
} from "@mui/icons-material";

interface CKEditorProps {
  value: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

const StyledEditorContent = styled(EditorContent)(({ theme }) => ({
  "& .ProseMirror": {
    padding: theme.spacing(2),
    minHeight: "300px",
    outline: "none",
    fontSize: "1rem",
    lineHeight: "1.6",
    "& p": {
      margin: theme.spacing(1, 0),
    },
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    "& ul, & ol": {
      paddingLeft: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    "& blockquote": {
      borderLeft: `4px solid ${theme.palette.grey[300]}`,
      paddingLeft: theme.spacing(2),
      color: theme.palette.text.secondary,
      margin: theme.spacing(2, 0),
    },
    "& img": {
      maxWidth: "100%",
      height: "auto",
    },
    "& code": {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.shape.borderRadius,
      fontFamily: "monospace",
    },
    "& a": {
      color: theme.palette.primary.main,
      textDecoration: "underline",
    },
  },
}));

const MenuButton = ({ disabled, onClick, active, children, title }: any) => {
  return (
    <Tooltip title={title}>
      <Button
        size="small"
        disableElevation
        onClick={onClick}
        disabled={disabled}
        sx={{
          minWidth: "36px",
          color: active ? "primary.main" : "inherit",
          backgroundColor: active
            ? (theme) => alpha(theme.palette.primary.main, 0.1)
            : "transparent",
          "&:hover": {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
          },
        }}
      >
        {children}
      </Button>
    </Tooltip>
  );
};

const CKEditor = ({ value, onChange, disabled = false }: CKEditorProps) => {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Editörün değerini dışarıdan güncelle
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  // Düzenleyici işlevleri
  const insertLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Bağlantı URL'si:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = () => {
    if (!editor) return;

    const url = window.prompt("Görsel URL'si:");

    if (url === null || url === "") return;

    editor.chain().focus().setImage({ src: url }).run();
  };

  if (!mounted) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderRadius: 1,
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          backgroundColor: (theme) => theme.palette.grey[50],
          borderBottom: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap",
          "& > *": { m: 0.25 },
        }}
      >
        <MenuButton
          title="Başlık 1"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor?.isActive("heading", { level: 1 }) || false}
          disabled={disabled}
        >
          <Title fontSize="small" />
        </MenuButton>

        <MenuButton
          title="Kalın"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold") || false}
          disabled={disabled}
        >
          <FormatBold fontSize="small" />
        </MenuButton>

        <MenuButton
          title="İtalik"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic") || false}
          disabled={disabled}
        >
          <FormatItalic fontSize="small" />
        </MenuButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <MenuButton
          title="Madde İşaretleri"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList") || false}
          disabled={disabled}
        >
          <FormatListBulleted fontSize="small" />
        </MenuButton>

        <MenuButton
          title="Numaralı Liste"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList") || false}
          disabled={disabled}
        >
          <FormatListNumbered fontSize="small" />
        </MenuButton>

        <MenuButton
          title="Alıntı"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote") || false}
          disabled={disabled}
        >
          <FormatQuote fontSize="small" />
        </MenuButton>

        <MenuButton
          title="Kod"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive("codeBlock") || false}
          disabled={disabled}
        >
          <Code fontSize="small" />
        </MenuButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <MenuButton
          title="Bağlantı Ekle"
          onClick={insertLink}
          active={editor?.isActive("link") || false}
          disabled={disabled}
        >
          <InsertLink fontSize="small" />
        </MenuButton>

        <MenuButton
          title="Görsel Ekle"
          onClick={insertImage}
          disabled={disabled}
        >
          <ImageIcon fontSize="small" />
        </MenuButton>

        <MenuButton
          title="Formatı Temizle"
          onClick={() =>
            editor?.chain().focus().clearNodes().unsetAllMarks().run()
          }
          disabled={disabled}
        >
          <FormatClear fontSize="small" />
        </MenuButton>
      </Toolbar>

      <Box>
        <StyledEditorContent editor={editor} />
      </Box>
    </Paper>
  );
};

export default CKEditor;
