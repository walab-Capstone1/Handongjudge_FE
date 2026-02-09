export interface TipTapEditorProps {
	content: string;
	onChange: (html: string) => void;
	placeholder?: string;
}

export interface CodeLanguageOption {
	value: string;
	label: string;
}
