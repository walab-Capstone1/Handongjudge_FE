import type {
	ProblemListFormData,
	ProblemListEditFormHandlers,
} from "../types";

export interface EditFormBasicFieldsProps {
	formData: ProblemListFormData;
	currentTag: string;
	setCurrentTag: (v: string) => void;
	handlers: Pick<
		ProblemListEditFormHandlers,
		| "handleInputChange"
		| "handleTagAdd"
		| "handleTagKeyPress"
		| "handleTagRemove"
	>;
}

/**
 * 편집 폼 - 기본 필드 (제목, 난이도, 태그)
 */
export default function EditFormBasicFields({
	formData,
	currentTag,
	setCurrentTag,
	handlers,
}: EditFormBasicFieldsProps) {
	const {
		handleInputChange,
		handleTagAdd,
		handleTagKeyPress,
		handleTagRemove,
	} = handlers;

	return (
		<>
			<div className="problem-create-form-section">
				<label
					className="problem-create-label"
					htmlFor="problem-list-modal-title"
				>
					문제 제목 *
				</label>
				<input
					id="problem-list-modal-title"
					type="text"
					name="title"
					value={formData.title}
					onChange={handleInputChange}
					className="problem-create-input"
					required
					placeholder="문제 제목을 입력하세요"
				/>
			</div>

			<div className="problem-create-form-row">
				<div className="problem-create-form-section">
					<label
						className="problem-create-label"
						htmlFor="problem-list-modal-difficulty"
					>
						난이도 *
					</label>
					<select
						id="problem-list-modal-difficulty"
						name="difficulty"
						value={formData.difficulty}
						onChange={handleInputChange}
						className="problem-create-input"
						required
					>
						<option value="1">Level 1</option>
						<option value="2">Level 2</option>
						<option value="3">Level 3</option>
					</select>
				</div>

				<div className="problem-create-form-section">
					<label
						className="problem-create-label"
						htmlFor="problem-list-modal-tag"
					>
						태그
					</label>
					<div className="problem-create-tag-input-wrapper">
						<input
							id="problem-list-modal-tag"
							type="text"
							value={currentTag}
							onChange={(e) => setCurrentTag(e.target.value)}
							onKeyPress={handleTagKeyPress}
							className="problem-create-input"
							placeholder="태그 입력 후 Enter"
						/>
						<button
							type="button"
							onClick={handleTagAdd}
							className="problem-create-tag-add-btn"
						>
							추가
						</button>
					</div>
					<div className="problem-create-tags">
						{formData.tags.map((tag, idx) => (
							<span key={`tag-${idx}-${tag}`} className="problem-create-tag">
								{tag}
								<button
									type="button"
									onClick={() => handleTagRemove(tag)}
									className="problem-create-tag-remove"
								>
									×
								</button>
							</span>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
