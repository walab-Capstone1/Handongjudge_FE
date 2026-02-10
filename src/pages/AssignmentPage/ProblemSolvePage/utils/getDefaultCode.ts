export function getDefaultCode(lang: string): string {
	switch (lang) {
		case "javascript":
			return "function solution() {\n  // 여기에 코드를 작성하세요\n  return;\n}";
		case "python":
			return "def solution():\n    # 여기에 코드를 작성하세요\n    return";
		case "java":
			return "public class Solution {\n    public static void main(String[] args) {\n        // 여기에 코드를 작성하세요\n    }\n}";
		case "cpp":
			return "#include <iostream>\nusing namespace std;\n\nint main() {\n    // 여기에 코드를 작성하세요\n    return 0;\n}";
		case "c":
			return "#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 작성하세요\n    return 0;\n}";
		default:
			return "// 여기에 코드를 작성하세요\n";
	}
}
