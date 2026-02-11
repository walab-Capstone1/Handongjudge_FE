import styled from "styled-components";

export const EditorWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000000;
  border-bottom: 1px solid #15181c;
  min-height: 0;

  .problem-solve-page.light & {
    background: #ffffff;
    border-bottom: 1px solid #e1e4e8;
  }
`;

export const EditorHeader = styled.div`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 16px;
  color: #58a6ff;
  background: linear-gradient(90deg, rgba(88, 166, 255, 0.1) 0%, rgba(88, 166, 255, 0.05) 100%);
  border-bottom: 1px solid #30363d;
  border-radius: 6px 6px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
  box-sizing: border-box;
  flex-shrink: 0;
  flex-grow: 0;
  max-height: 48px;

  .problem-solve-page.light & {
    color: #0969da;
    background: linear-gradient(90deg, rgba(9, 105, 218, 0.1) 0%, rgba(9, 105, 218, 0.05) 100%);
    border-bottom: 1px solid #e1e4e8;
  }
`;

export const EditorHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const SessionSaveStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-weight: normal;
`;

export const SaveStatus = styled.span<{
	$status: "saving" | "saved" | "error" | "cleared";
}>`
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;

  ${(props) => {
		switch (props.$status) {
			case "saving":
				return `
          background-color: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        `;
			case "saved":
				return `
          background-color: rgba(40, 167, 69, 0.2);
          color: #28a745;
        `;
			case "error":
				return `
          background-color: rgba(220, 53, 69, 0.2);
          color: #dc3545;
        `;
			case "cleared":
				return `
          background-color: rgba(108, 117, 125, 0.2);
          color: #6c757d;
        `;
		}
	}}

  .problem-solve-page.light & {
    ${(props) => {
			switch (props.$status) {
				case "saving":
					return `background-color: rgba(255, 193, 7, 0.1);`;
				case "saved":
					return `background-color: rgba(40, 167, 69, 0.1);`;
				case "error":
					return `background-color: rgba(220, 53, 69, 0.1);`;
				case "cleared":
					return `
            background-color: rgba(108, 117, 125, 0.1);
            color: #495057;
          `;
			}
		}}
  }
`;

export const ShortcutHint = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-style: italic;

  .problem-solve-page.light & {
    color: rgba(0, 0, 0, 0.5);
  }
`;

export const LoadSource = styled.span<{ $source: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;

  ${(props) => {
		switch (props.$source) {
			case "session":
				return `
          background-color: rgba(88, 166, 255, 0.2);
          color: #58a6ff;
          border: 1px solid rgba(88, 166, 255, 0.3);
        `;
			case "backend":
				return `
          background-color: rgba(40, 167, 69, 0.2);
          color: #28a745;
          border: 1px solid rgba(40, 167, 69, 0.3);
        `;
			case "default":
				return `
          background-color: rgba(255, 193, 7, 0.2);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
        `;
		}
	}}

  .problem-solve-page.light & {
    ${(props) => {
			switch (props.$source) {
				case "session":
					return `
            background-color: rgba(88, 166, 255, 0.1);
            color: #0366d6;
            border: 1px solid rgba(88, 166, 255, 0.2);
          `;
				case "backend":
					return `
            background-color: rgba(40, 167, 69, 0.1);
            color: #28a745;
            border: 1px solid rgba(40, 167, 69, 0.2);
          `;
				case "default":
					return `
            background-color: rgba(255, 193, 7, 0.1);
            color: #856404;
            border: 1px solid rgba(255, 193, 7, 0.2);
          `;
			}
		}}
  }
`;

export const EditorHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 100;
`;

export const DueDateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 107, 107, 0.3);

  .problem-solve-page.light & {
    color: #d63384;
    background: rgba(220, 53, 132, 0.1);
    border: 1px solid rgba(220, 53, 132, 0.3);
  }
`;

export const DueDateIcon = styled.span`
  font-size: 12px;
`;

export const DueDateText = styled.span`
  font-weight: 500;
`;

export const SubmitButton = styled.button<{ $variant?: "test" | "save" }>`
  padding: 6px 12px;
  background-color: #2f81f7;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;

  ${(props) =>
		props.$variant === "test" &&
		`
    margin-left: 8px;
  `}

  ${(props) =>
		props.$variant === "save" &&
		`
    background-color: #28a745;
    &:hover {
      background-color: #218838;
    }
  `}

  &:hover {
    background-color: #1f6feb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #6c757d;
    color: #ffffff;
  }
`;

export const EditorScrollArea = styled.div`
  flex: 1;
  overflow: auto;
  background-color: #000000;

  .problem-solve-page.light & {
    background-color: #ffffff;
  }
`;
