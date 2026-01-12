import { remark } from 'remark';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkRehype from 'remark-rehype';

/**
 * 마크다운을 HTML로 변환
 * @param {string} markdown - 마크다운 텍스트
 * @returns {Promise<string>} HTML 문자열
 */
export const markdownToHtml = async (markdown) => {
  if (!markdown) return '';
  
  try {
    const file = await remark()
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(markdown);
    
    return String(file);
  } catch (error) {
    console.error('마크다운 변환 실패:', error);
    // 변환 실패 시 간단한 파싱 시도
    return markdownToHtmlSync(markdown);
  }
};

/**
 * 마크다운을 동기적으로 HTML로 변환 (간단한 버전)
 * @param {string} markdown - 마크다운 텍스트
 * @returns {string} HTML 문자열
 */
export const markdownToHtmlSync = (markdown) => {
  if (!markdown) return '';
  
  // 간단한 마크다운 파싱 (기본적인 것만)
  let html = markdown;
  
  // 헤더
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // 볼드
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 코드 블록
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 인용구
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // 리스트
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // 줄바꿈
  html = html.replace(/\n/g, '<br>');
  
  return html;
};

