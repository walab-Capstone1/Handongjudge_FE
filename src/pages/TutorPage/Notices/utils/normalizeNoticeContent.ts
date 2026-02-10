/**
 * TipTap 에디터가 반환하는 HTML에서 단일 <p> 래퍼를 제거합니다.
 * 예: "<p>내용</p>" → "내용", "<p><br></p>" → ""
 * 여러 단락이나 다른 블록이 있으면 그대로 반환합니다.
 */
export function normalizeNoticeContent(html: string): string {
	const trimmed = html.trim();
	if (!trimmed) return trimmed;

	const div = document.createElement("div");
	div.innerHTML = trimmed;

	const children = div.childNodes;
	if (children.length !== 1) return trimmed;

	const first = children[0];
	if (first.nodeType !== Node.ELEMENT_NODE) return trimmed;
	if ((first as Element).tagName !== "P") return trimmed;

	return (first as Element).innerHTML.trim();
}
