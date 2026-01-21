import React, { useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { MdImage } from 'react-icons/md';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // VS Code 스타일 테마
import './TipTapEditor.css';

// 지원 언어 목록
const CODE_LANGUAGES = [
  { value: '', label: '언어 선택' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
];

const TipTapEditor = ({ content, onChange, placeholder }) => {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // CodeBlock extension을 별도로 추가하므로 비활성화
        heading: false, // Heading 대신 fontSize 사용
      }),
      TextStyle,
      FontSize,
      CodeBlock.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            language: {
              default: null,
              parseHTML: element => element.getAttribute('data-language'),
              renderHTML: attributes => {
                if (!attributes.language) {
                  return {};
                }
                return {
                  'data-language': attributes.language,
                };
              },
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: placeholder || '질문 내용을 자세히 작성해주세요...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  const handleFontSizeChange = (fontSize) => {
    if (!editor) return;
    
    if (fontSize === '') {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(parseInt(fontSize)).run();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);

    // 파일 input 리셋
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentFontSize = () => {
    if (!editor) return '';
    const attrs = editor.getAttributes('textStyle');
    return attrs.fontSize || '';
  };

  const getCurrentCodeBlockLanguage = () => {
    if (!editor) return '';
    const attrs = editor.getAttributes('codeBlock');
    return attrs.language || '';
  };

  const handleCodeBlockLanguageChange = (language) => {
    if (!editor) return;
    editor.chain().focus().updateAttributes('codeBlock', { language: language || null }).run();
    // 언어 변경 후 하이라이팅 다시 적용
    setTimeout(() => {
      highlightCodeBlocks();
    }, 100);
  };

  // 코드 블록 하이라이팅 적용
  const highlightCodeBlocks = () => {
    if (!editor) return;
    const editorElement = editor.view.dom.closest('.tiptap-editor-wrapper');
    if (!editorElement) return;

    const codeBlocks = editorElement.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      const preElement = block.closest('pre');
      const language = preElement?.getAttribute('data-language') || '';
      
      // 이미 하이라이팅된 경우 제거 (중복 방지)
      block.className = block.className.replace(/hljs-[^\s]+/g, '').trim();
      
      if (language && hljs.getLanguage(language)) {
        try {
          const highlighted = hljs.highlight(block.textContent || '', { language });
          block.innerHTML = highlighted.value;
          block.className = `hljs ${language} ${block.className}`.trim();
        } catch (err) {
          console.error('하이라이팅 실패:', err);
        }
      } else if (language) {
        // 언어를 알 수 없는 경우 자동 감지
        try {
          const highlighted = hljs.highlightAuto(block.textContent || '');
          block.innerHTML = highlighted.value;
          block.className = `hljs ${block.className}`.trim();
        } catch (err) {
          console.error('하이라이팅 실패:', err);
        }
      }
    });
  };

  // 에디터 콘텐츠 변경 시 하이라이팅 적용
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setTimeout(() => {
        highlightCodeBlocks();
      }, 10);
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    // 초기 하이라이팅
    handleUpdate();

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const isCodeBlockActive = editor.isActive('codeBlock');

  return (
    <div className="tiptap-editor-wrapper">
      <div className="tiptap-toolbar">
        {/* 글자 크기 드롭다운 */}
        <select
          className="font-size-select"
          value={getCurrentFontSize()}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          title="글자 크기"
        >
          <option value="">글자 크기</option>
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
          <option value="32">32px</option>
          <option value="36">36px</option>
          <option value="48">48px</option>
        </select>
        <div className="toolbar-divider" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="굵게"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="기울임"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
          title="인라인 코드"
        >
          {'</>'}
        </button>
        <div className="toolbar-divider" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="글머리 기호"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="번호 매기기"
        >
          1.
        </button>
        <div className="toolbar-divider" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title="코드 블록"
        >
          {'<>'}
        </button>
        {isCodeBlockActive && (
          <select
            className="code-language-select"
            value={getCurrentCodeBlockLanguage()}
            onChange={(e) => handleCodeBlockLanguageChange(e.target.value)}
            title="언어 선택"
            onClick={(e) => e.stopPropagation()}
          >
            {CODE_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="인용"
        >
          "
        </button>
        <div className="toolbar-divider" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="이미지 삽입"
        >
          <MdImage />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;

