import styled from "styled-components";

export const ResultArea = styled.div`
  padding: 0 0 8px 0;
  overflow: hidden;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .problem-solve-page.light & {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
  }

  > div:not(.result-header) {
    padding: 0 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

export const ResultLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  opacity: 0.6;

  .loading-spinner {
    margin-right: 10px;
  }
`;

export const ResultSummary = styled.div<{
	$type?: "success" | "error" | "warning";
}>`
  margin-bottom: 12px;
  padding: ${(props) => (props.$type ? "16px" : "12px")};
  border-radius: 4px;

  ${(props) => {
		switch (props.$type) {
			case "success":
				return `
          background-color: #1a3d1a;
          border-left: 4px solid #28a745;
        `;
			case "error":
				return `
          background-color: #3d1a1a;
          border-left: 4px solid #dc3545;
        `;
			case "warning":
				return `
          background-color: #3d3d1a;
          border-left: 4px solid #ffc107;
        `;
			default:
				return `
          background-color: #1a3d1a;
          color: #6bff6b;
        `;
		}
	}}

  .problem-solve-page.light & {
    ${(props) => {
			switch (props.$type) {
				case "success":
					return `
            background-color: #d4edda;
            border-left-color: #28a745;
          `;
				case "error":
					return `
            background-color: #ffeef0;
            border-left-color: #dc3545;
          `;
				case "warning":
					return `
            background-color: #fff3cd;
            border-left-color: #ffc107;
          `;
				default:
					return `
            background-color: #d4edda;
            color: #155724;
          `;
			}
		}}
  }

  flex-shrink: 0;
`;

export const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

export const SummaryIcon = styled.span<{
	$type: "success" | "error" | "warning";
}>`
  font-size: 20px;
  line-height: 1;
`;

export const SummaryTitle = styled.strong`
  font-size: 18px;
  font-weight: 600;

  ${ResultSummary}[data-type="success"] & {
    color: #28a745;
  }

  ${ResultSummary}[data-type="error"] & {
    color: #dc3545;
  }

  ${ResultSummary}[data-type="warning"] & {
    color: #ffc107;
  }
`;

export const SummaryDescription = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  opacity: 0.9;
`;

export const SummaryDetails = styled.div`
  margin-bottom: 12px;
`;

export const SummaryDetail = styled.div`
  font-size: 13px;
  opacity: 0.8;
  margin-bottom: 4px;
`;

export const SubmissionInfo = styled.div`
  font-size: 12px;
  opacity: 0.7;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
`;

export const ErrorMessage = styled.div`
  margin-top: 12px;
  padding: 12px;
  border-radius: 4px;
  background-color: #3d1a1a;
  color: #ff6b6b;
  font-size: 14px;
  flex-shrink: 0;

  .problem-solve-page.light & {
    background-color: #ffeef0;
    color: #ff3d50;
  }
`;

export const TestcasesSection = styled.div`
  margin-top: 16px;
  border-top: 1px solid #30363d;
  padding-top: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .problem-solve-page.light & {
    border-top: 1px solid #e1e4e8;
  }
`;

export const TestcasesHeader = styled.div`
  margin-bottom: 12px;
  color: #58a6ff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;

  .problem-solve-page.light & {
    color: #0969da;
  }
`;

export const TestcaseButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  flex-shrink: 0;
`;

export const TestcaseButton = styled.button<{
	$result: string;
	$selected?: boolean;
}>`
  padding: 8px 12px;
  border: 2px solid #30363d;
  border-radius: 6px;
  background-color: #21262d;
  color: #c9d1d9;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;

  &:hover {
    background-color: #30363d;
  }

  ${(props) =>
		props.$selected &&
		`
    border-color: #58a6ff;
    background-color: rgba(88, 166, 255, 0.1);
    color: #58a6ff;
  `}

  ${(props) => {
		switch (props.$result) {
			case "correct":
				return `
          border-color: #28a745;
          background-color: #28a745;
          color: white;

          &:hover {
            background-color: #218838;
          }

          ${
						props.$selected &&
						`
            background-color: #1e7e34;
            border-color: #1c7430;
          `
					}
        `;
			case "wrong-answer":
			case "timelimit":
			case "memory-limit":
			case "run-error":
			case "compiler-error":
				return `
          border-color: #dc3545;
          background-color: #dc3545;
          color: white;

          &:hover {
            background-color: #c82333;
          }

          ${
						props.$selected &&
						`
            background-color: #bd2130;
            border-color: #b21f2d;
          `
					}
        `;
			case "not-run":
				return `
          border-color: #6c757d;
          background-color: #6c757d;
          color: white;

          &:hover {
            background-color: #5a6268;
          }

          ${
						props.$selected &&
						`
            background-color: #545b62;
            border-color: #4e555b;
          `
					}
        `;
			default:
				return "";
		}
	}}

  .problem-solve-page.light & {
    border-color: #e1e4e8;
    background-color: #ffffff;
    color: #24292e;

    &:hover {
      background-color: #f6f8fa;
    }

    ${(props) =>
			props.$selected &&
			`
      border-color: #0969da;
      background-color: rgba(9, 105, 218, 0.1);
      color: #0969da;
    `}

    ${(props) => {
			switch (props.$result) {
				case "correct":
					return `
            border-color: #28a745;
            background-color: #28a745;
            color: white;

            &:hover {
              background-color: #218838;
            }

            ${
							props.$selected &&
							`
              background-color: #1e7e34;
              border-color: #1c7430;
            `
						}
          `;
				case "wrong-answer":
				case "timelimit":
				case "memory-limit":
				case "run-error":
				case "compiler-error":
					return `
            border-color: #dc3545;
            background-color: #dc3545;
            color: white;

            &:hover {
              background-color: #c82333;
            }

            ${
							props.$selected &&
							`
              background-color: #bd2130;
              border-color: #b21f2d;
            `
						}
          `;
				case "not-run":
					return `
            border-color: #6c757d;
            background-color: #6c757d;
            color: white;

            &:hover {
              background-color: #5a6268;
            }

            ${
							props.$selected &&
							`
              background-color: #545b62;
              border-color: #4e555b;
            `
						}
          `;
				default:
					return "";
			}
		}}
  }
`;

export const SelectedTestcase = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid #30363d;
  border-radius: 8px;
  background-color: #0d1117;
  padding: 16px;

  .problem-solve-page.light & {
    border-color: #e1e4e8;
    background-color: #ffffff;
  }
`;

export const TestcaseInfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #30363d;

  .problem-solve-page.light & {
    border-bottom-color: #e1e4e8;
  }
`;

export const TestcaseNumber = styled.span`
  color: #e1e4e8;
  font-size: 14px;

  .problem-solve-page.light & {
    color: #24292e;
  }
`;

export const TestcaseResult = styled.span<{ $result: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;

  ${(props) => {
		switch (props.$result) {
			case "correct":
				return `
          background-color: #28a745;
          color: white;
        `;
			case "wrong-answer":
				return `
          background-color: #dc3545;
          color: white;
        `;
			case "timelimit":
				return `
          background-color: #ffc107;
          color: #212529;
        `;
			case "memory-limit":
				return `
          background-color: #fd7e14;
          color: white;
        `;
			case "run-error":
				return `
          background-color: #e83e8c;
          color: white;
        `;
			case "compiler-error":
				return `
          background-color: #6f42c1;
          color: white;
        `;
			case "not-run":
				return `
          background-color: #6c757d;
          color: white;
        `;
			default:
				return `
          background-color: #6c757d;
          color: white;
        `;
		}
	}}
`;

export const TestcaseDetails = styled.div`
  margin-top: 12px;
`;

export const TestcaseStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
`;

export const StatItem = styled.span`
  color: #c9d1d9;

  .problem-solve-page.light & {
    color: #586069;
  }
`;

export const TestcaseSection = styled.div`
  margin-top: 12px;
`;

export const Label = styled.div<{
	$type: "input" | "expected" | "output" | "error" | "diff";
}>`
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;

  ${(props) => {
		switch (props.$type) {
			case "input":
				return `color: #7c3aed !important;`;
			case "expected":
				return `color: #059669 !important;`;
			case "output":
				return `color: #58a6ff !important;`;
			case "error":
				return `color: #ff6b6b !important;`;
			case "diff":
				return `color: #ffc107 !important;`;
			default:
				return `color: #58a6ff;`;
		}
	}}

  .problem-solve-page.light & {
    ${(props) => {
			switch (props.$type) {
				case "input":
					return `color: #7c3aed !important;`;
				case "expected":
					return `color: #059669 !important;`;
				case "output":
					return `color: #0969da !important;`;
				case "error":
					return `color: #d63384 !important;`;
				case "diff":
					return `color: #f57c00 !important;`;
				default:
					return `color: #0969da;`;
			}
		}}
  }
`;

export const Content = styled.div`
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 4px;
  padding: 8px;
  max-height: 150px;
  overflow-y: auto;

  .problem-solve-page.light & {
    background-color: #ffffff;
    border: 1px solid #e1e4e8;
  }

  pre {
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;
    color: #e1e4e8;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 11px;
    line-height: 1.4;
    white-space: pre-wrap;
    word-wrap: break-word;

    .problem-solve-page.light & {
      color: #24292e;
    }
  }
`;

export const DiffHighlighted = styled.div`
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  line-height: 1.4;
`;

export const DiffLine = styled.div<{ $error?: boolean }>`
  margin: 2px 0;
  padding: 2px 4px;
  border-radius: 2px;

  ${(props) =>
		props.$error &&
		`
    background-color: rgba(220, 53, 69, 0.2);
    color: #ff6b6b;
    font-weight: 600;

    .problem-solve-page.light & {
      background-color: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }
  `}
`;

export const DiffExpected = styled.span`
  background-color: rgba(40, 167, 69, 0.2);
  color: #28a745;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
  text-decoration: underline;

  .problem-solve-page.light & {
    background-color: rgba(40, 167, 69, 0.1);
    color: #28a745;
  }
`;

export const DiffActual = styled.span`
  background-color: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
  text-decoration: underline;

  .problem-solve-page.light & {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }
`;
