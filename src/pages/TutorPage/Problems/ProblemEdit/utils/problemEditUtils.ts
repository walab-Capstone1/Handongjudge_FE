export function parseTags(source: unknown): string[] {
	if (!source) return [];
	if (Array.isArray(source)) {
		return source.map((t) => t && String(t).trim()).filter(Boolean);
	}
	if (typeof source === "string") {
		try {
			const parsed = JSON.parse(source);
			if (Array.isArray(parsed)) {
				return parsed
					.map((t: unknown) => t && String(t).trim())
					.filter(Boolean);
			}
			if (parsed && String(parsed).trim()) return [String(parsed).trim()];
		} catch {
			if (source.trim()) return [source.trim()];
		}
	}
	return [];
}

export function extractTextFromRTF(rtfContent: string): string {
	if (rtfContent.trim().startsWith("{\\rtf")) {
		return rtfContent
			.replace(/\\[a-z]+\d*\s?/gi, "")
			.replace(/\{[^}]*\}/g, "")
			.replace(/\\[{}]/g, "")
			.trim()
			.replace(/\s+/g, " ")
			.trim();
	}
	return rtfContent;
}
