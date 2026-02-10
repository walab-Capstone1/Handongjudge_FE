import { remark } from "remark";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";

/**
 * 마크다운을 HTML로 변환
 */
export const markdownToHtml = async (markdown: string): Promise<string> => {
	if (!markdown) return "";

	try {
		const file = await remark()
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeRaw)
			.use(rehypeStringify, { allowDangerousHtml: true })
			.process(markdown);

		return String(file);
	} catch (error) {
		console.error("마크다운 변환 실패:", error);
		return markdownToHtmlSync(markdown);
	}
};

/**
 * 마크다운을 동기적으로 HTML로 변환 (간단한 버전)
 */
export const markdownToHtmlSync = (markdown: string): string => {
	if (!markdown) return "";

	let html = markdown;

	html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
	html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
	html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
	html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
	html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
	html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
	html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
	html = html.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>");
	html = html.replace(/^\- (.*$)/gim, "<li>$1</li>");
	html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
	html = html.replace(/\n/g, "<br>");

	return html;
};
