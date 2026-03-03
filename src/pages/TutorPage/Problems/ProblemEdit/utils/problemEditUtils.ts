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

/**
 * API 등에서 받은 description에 "## 입력 형식"~"## 예제" 블록이 두 번 들어있을 때,
 * 두 번째 블록부터 제거해 한 번만 보이게 합니다.
 */
export function stripDuplicateInputOutputExample(description: string): string {
	if (!description || !description.includes("입력 형식")) return description;
	const normalized = description.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const regex = /(\n|^)\s*##\s*입력\s*형식\s*[\n\r]/g;
	const matches = [...normalized.matchAll(regex)];
	if (matches.length < 2) return description;
	const secondMatch = matches[1];
	if (!secondMatch || secondMatch.index == null) return description;
	return normalized.slice(0, secondMatch.index).trim();
}

/**
 * 미리보기용: description에서 "## 입력 형식" 이하 섹션을 제거해 본문만 반환합니다.
 * (입력/출력/예제는 전용 필드로 따로 보여주므로, 본문 영역에서는 한 번만 보이게 함)
 * 줄 맨 앞에 있거나 문장 중간에 있어도 잘리도록 매칭합니다.
 */
export function descriptionForPreview(description: string): string {
	if (!description || !description.includes("입력 형식")) return description;
	const normalized = description.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	// (\n|^) = 줄바꿈 또는 문자열 시작 다음에 오는 "## 입력 형식"
	const match = normalized.match(/(\n|^)\s*##\s*입력\s*형식\s*[\n\r]/);
	if (!match || match.index == null) return description;
	return normalized.slice(0, match.index).trim();
}

export interface ParsedDescriptionSections {
	mainDescription: string;
	inputFormat: string;
	outputFormat: string;
	sampleInputs: { input: string; output: string }[];
}

/**
 * 줄바꿈 정규화 (\\r\\n, \\r → \\n)
 */
function normalizeNewlines(s: string): string {
	return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * 저장된 문제 설명(description)에서 "## 입력 형식", "## 출력 형식", "## 예제" 섹션을 분리합니다.
 * 편집 시 폼 필드에 맞게 채우고, 저장 시 중복 저장을 막기 위해 사용합니다.
 * 줄바꿈 형식(\\n vs \\r\\n)에 관계없이 동작하도록 정규화합니다.
 */
export function parseDescriptionSections(
	fullDescription: string,
): ParsedDescriptionSections {
	const raw = fullDescription ? normalizeNewlines(fullDescription.trim()) : "";
	const result: ParsedDescriptionSections = {
		mainDescription: raw,
		inputFormat: "",
		outputFormat: "",
		sampleInputs: [{ input: "", output: "" }],
	};
	if (!raw.includes("입력 형식") && !raw.includes("출력 형식")) {
		return result;
	}

	// 유연한 마커 매칭: "## 입력 형식" 앞뒤 공백/줄바꿈 허용
	const inputFormatRegex = /\n+##\s*입력\s*형식\s*\n+/;
	const outputFormatRegex = /\n+##\s*출력\s*형식\s*\n+/;
	const exampleRegex = /\n+##\s*예제\s*(\n|$)/;

	const inputMatch = raw.match(inputFormatRegex);
	if (!inputMatch || inputMatch.index == null) return result;

	const idxInput = inputMatch.index;
	result.mainDescription = raw.slice(0, idxInput).trim();

	const afterInput = raw.slice(idxInput + inputMatch[0].length);
	const outputMatch = afterInput.match(outputFormatRegex);
	if (!outputMatch || outputMatch.index == null) {
		result.inputFormat = afterInput.trim();
		return result;
	}
	result.inputFormat = afterInput.slice(0, outputMatch.index).trim();

	const afterOutput = afterInput.slice(
		outputMatch.index + outputMatch[0].length,
	);
	const exampleMatch = afterOutput.match(exampleRegex);
	if (!exampleMatch || exampleMatch.index == null) {
		result.outputFormat = afterOutput.trim();
		return result;
	}
	result.outputFormat = afterOutput.slice(0, exampleMatch.index).trim();

	const examplesBlock = afterOutput
		.slice(exampleMatch.index + exampleMatch[0].length)
		.trim();
	const samples = parseExampleSection(examplesBlock);
	result.sampleInputs =
		samples.length > 0 ? samples : [{ input: "", output: "" }];
	return result;
}

/** "### 예제 입력 N\n```\n...\n```\n\n### 예제 출력 N\n```\n...\n```" 형식 파싱. 줄바꿈 유연 처리 */
function parseExampleSection(block: string): { input: string; output: string }[] {
	const normalized = normalizeNewlines(block);
	const samples: { input: string; output: string }[] = [];
	// ``` 다음에 줄바꿈 0~1개 후 내용, 그 다음 ``` 까지
	const inputRegex = /###\s*예제\s*입력\s*(\d+)\s*[\n\r]+```[\n\r]*([\s\S]*?)```/g;
	const outputRegex = /###\s*예제\s*출력\s*(\d+)\s*[\n\r]+```[\n\r]*([\s\S]*?)```/g;

	const inputMatches = [...normalized.matchAll(inputRegex)];
	const outputMatches = [...normalized.matchAll(outputRegex)];

	const maxIdx = Math.max(
		inputMatches.length,
		outputMatches.length,
		1,
	);
	for (let i = 0; i < maxIdx; i++) {
		const inputNum = i + 1;
		const inMatch = inputMatches.find(
			(m) => Number(m[1]) === inputNum,
		);
		const outMatch = outputMatches.find(
			(m) => Number(m[1]) === inputNum,
		);
		samples.push({
			input: inMatch ? inMatch[2].trim() : "",
			output: outMatch ? outMatch[2].trim() : "",
		});
	}
	return samples;
}
