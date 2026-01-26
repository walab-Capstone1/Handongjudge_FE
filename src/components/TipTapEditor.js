import React, { useRef, useState, useEffect, useCallback } from 'react';
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
    onCreate: ({ editor }) => {
      // 에디터가 생성된 후 하이라이팅 적용
      setTimeout(() => {
        try {
          if (editor && editor.view && editor.view.dom) {
            highlightCodeBlocks();
          }
        } catch (error) {
          console.warn('에디터 초기화 중 하이라이팅 실패:', error);
        }
      }, 100);
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
    try {
      editor.chain().focus().updateAttributes('codeBlock', { language: language || null }).run();
      // 언어 변경 후 하이라이팅 다시 적용
      setTimeout(() => {
        try {
          if (editor && editor.view) {
            const dom = editor.view.dom;
            if (dom) {
              highlightCodeBlocks();
            }
          }
        } catch (error) {
          console.warn('언어 변경 후 하이라이팅 실패:', error);
        }
      }, 100);
    } catch (error) {
      console.warn('코드 블록 언어 변경 실패:', error);
    }
  };

  // 코드 블록 하이라이팅 적용
  const highlightCodeBlocks = useCallback(() => {
    try {
      if (!editor) return;
      
      // 에디터 뷰가 준비되었는지 안전하게 확인
      if (!editor.view) return;
      
      // DOM에 안전하게 접근
      let editorDom;
      try {
        editorDom = editor.view.dom;
      } catch (error) {
        // view.dom에 접근할 수 없는 경우 (아직 마운트되지 않음)
        return;
      }
      
      if (!editorDom) return;
      
      const editorElement = editorDom.closest('.tiptap-editor-wrapper');
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
    } catch (error) {
      // 에러가 발생해도 앱이 크래시되지 않도록 함
      console.warn('코드 블록 하이라이팅 중 오류:', error);
    }
  }, [editor]);

  // 에디터 콘텐츠 변경 시 하이라이팅 적용
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // 에디터가 완전히 마운트된 후에만 하이라이팅 시도
      setTimeout(() => {
        try {
          // 안전하게 에디터 상태 확인
          if (editor && editor.view) {
            try {
              // view.dom에 접근 시도
              const dom = editor.view.dom;
              if (dom) {
                highlightCodeBlocks();
              }
            } catch (error) {
              // view.dom에 접근할 수 없는 경우 (아직 마운트되지 않음)
              // 조용히 무시하고 다음 업데이트에서 다시 시도
            }
          }
        } catch (error) {
          console.warn('하이라이팅 업데이트 중 오류:', error);
        }
      }, 10);
    };

    // 에디터가 마운트될 때까지 대기
    let retryCount = 0;
    const maxRetries = 20;
    
    const checkAndSetup = () => {
      try {
        // 안전하게 에디터 상태 확인
        if (editor && editor.view) {
          try {
            // view.dom에 접근 시도
            const dom = editor.view.dom;
            if (dom) {
              // 에디터가 준비되었으므로 이벤트 리스너 등록
              editor.on('update', handleUpdate);
              editor.on('selectionUpdate', handleUpdate);
              // 초기 하이라이팅
              handleUpdate();
              return; // 성공적으로 설정되었으므로 종료
            }
          } catch (error) {
            // view.dom에 접근할 수 없는 경우 (아직 마운트되지 않음)
          }
        }
        
        // 아직 마운트되지 않았다면 다시 시도
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkAndSetup, 50);
        }
      } catch (error) {
        console.warn('에디터 설정 중 오류:', error);
      }
    };

    // 약간의 지연 후 설정 시작 (에디터가 완전히 초기화될 시간 제공)
    const timeoutId = setTimeout(checkAndSetup, 100);

    return () => {
      clearTimeout(timeoutId);
      if (editor) {
        try {
          editor.off('update', handleUpdate);
          editor.off('selectionUpdate', handleUpdate);
        } catch (error) {
          // 정리 중 오류는 무시
        }
      }
    };
  }, [editor, highlightCodeBlocks]);

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

