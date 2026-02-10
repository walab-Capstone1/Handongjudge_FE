import type React from "react";
import * as S from "../AssignmentModals/styles";
import type { ProblemCreateModalProps } from "./types";

const StandaloneProblemCreateModal: React.FC<ProblemCreateModalProps> = ({
	isOpen,
	formData,
	onClose,
	onSubmit,
	onInputChange,
}) => {
	if (!isOpen) return null;

	return (
		<S.Overlay onClick={onClose}>
			<S.Content onClick={(e: React.MouseEvent) => e.stopPropagation()}>
				<S.Header>
					<h2>새 문제 만들기</h2>
					<S.CloseButton type="button" onClick={onClose}>
						✕
					</S.CloseButton>
				</S.Header>

				<form onSubmit={onSubmit}>
					<S.Body
						as="div"
						style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
					>
						<S.FormGroup>
							<S.FormLabel htmlFor="standaloneProblemTitle">
								문제 제목 *
							</S.FormLabel>
							<S.FormInput
								type="text"
								id="standaloneProblemTitle"
								name="title"
								value={formData.title}
								onChange={onInputChange}
								placeholder="문제 제목을 입력하세요"
								required
							/>
						</S.FormGroup>

						<S.InfoBox>
							<p>
								<strong>📄 문제 설명 파일 우선순위:</strong>
							</p>
							<p>1. 별도 업로드 파일 (최우선) - .md, .txt, .tex 지원</p>
							<p>
								2. ZIP 파일 내 problem_statement 폴더의 파일 (.tex → .md → .txt
								순)
							</p>
							<p>3. 파일이 없으면 빈 설명으로 생성됩니다.</p>
						</S.InfoBox>

						<S.FormGroup>
							<S.FormLabel htmlFor="standaloneDescriptionFile">
								문제 설명 파일 <S.OptionalLabel>(선택사항)</S.OptionalLabel>
							</S.FormLabel>
							<S.FileInput
								id="standaloneDescriptionFile"
								name="descriptionFile"
								onChange={onInputChange}
								accept=".md,.txt,.tex"
							/>
							<S.FormHelp>
								마크다운(.md), 텍스트(.txt), LaTeX(.tex) 형식의 문제 설명 파일을
								업로드하세요.
								<br />이 파일이 있으면 ZIP 파일 내부 설명보다 우선 적용됩니다.
								{formData.descriptionFile && (
									<S.FileSelected>
										선택됨: {formData.descriptionFile.name}
									</S.FileSelected>
								)}
							</S.FormHelp>
						</S.FormGroup>

						<S.FormGroup>
							<S.FormLabel htmlFor="standaloneZipFile">
								문제 파일 (.zip) *
							</S.FormLabel>
							<S.FileInput
								id="standaloneZipFile"
								name="zipFile"
								onChange={onInputChange}
								accept=".zip"
								required
							/>
							<S.FormHelp>
								테스트 케이스와 정답이 포함된 ZIP 파일을 업로드하세요. (최대
								50MB)
								<br />
								ZIP 내부에 problem_statement 폴더가 있으면 자동으로 설명을
								추출합니다.
								{formData.zipFile && (
									<S.FileSelected>
										선택됨: {formData.zipFile.name} (
										{(formData.zipFile.size / 1024 / 1024).toFixed(2)}MB)
									</S.FileSelected>
								)}
							</S.FormHelp>
						</S.FormGroup>

						<S.InfoBox>
							<p>
								<strong>💡 안내:</strong>
							</p>
							<p>• 이 기능은 문제만 생성합니다</p>
							<p>
								• 생성 후 원하는 과제에서 &quot;문제 추가&quot; 버튼으로 추가할
								수 있습니다
							</p>
							<p>• 여러 과제에 동일한 문제를 재사용할 수 있습니다</p>
						</S.InfoBox>

						<S.Actions>
							<S.BtnSecondary type="button" onClick={onClose}>
								취소
							</S.BtnSecondary>
							<S.BtnPrimary type="submit">문제 생성</S.BtnPrimary>
						</S.Actions>
					</S.Body>
				</form>
			</S.Content>
		</S.Overlay>
	);
};

export default StandaloneProblemCreateModal;
