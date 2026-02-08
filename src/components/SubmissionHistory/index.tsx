import type React from "react";
import { useState, useEffect } from "react";
import APIService from "../../services/APIService";
import * as S from "./styles";

interface Submission {
	submissionId?: number;
	submittedAt: string;
	result: string;
	code?: string;
	executionTime?: number;
	memoryUsage?: number;
	language?: string;
}

interface SubmissionHistoryProps {
	problemId: number;
	sectionId: number;
	userId: number;
	onClose: () => void;
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
	problemId,
	sectionId,
	userId,
	onClose,
}) => {
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [selectedSubmission, setSelectedSubmission] =
		useState<Submission | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchHistory();
	}, [problemId, sectionId, userId]);

	const fetchHistory = async () => {
		try {
			setLoading(true);
			const response = await APIService.getSubmissionHistory(
				problemId,
				sectionId,
				userId,
			);
			const data = response?.data ?? response ?? [];
			const list = Array.isArray(data) ? data : [];
			setSubmissions(list);
			if (list.length > 0) {
				setSelectedSubmission(list[0]);
			} else {
				setSelectedSubmission(null);
			}
		} catch (error) {
			console.error("Failed to fetch submission history:", error);
			setSubmissions([]);
			setSelectedSubmission(null);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmissionClick = (submission: Submission) => {
		setSelectedSubmission(submission);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	return (
		<S.Container>
			<S.Sidebar>
				<S.SidebarTitle>Submission History</S.SidebarTitle>
				<S.SubmissionList>
					{loading ? (
						<p>Loading...</p>
					) : submissions.length === 0 ? (
						<p>No submissions found.</p>
					) : (
						submissions.map((sub, index) => (
							<S.SubmissionItem
								key={sub.submissionId ?? index}
								$active={selectedSubmission === sub}
								onClick={() => handleSubmissionClick(sub)}
							>
								<S.SubmissionTime>
									{formatDate(sub.submittedAt)}
								</S.SubmissionTime>
								<S.SubmissionResult $success={sub.result === "AC"}>
									{sub.result}
								</S.SubmissionResult>
							</S.SubmissionItem>
						))
					)}
				</S.SubmissionList>
			</S.Sidebar>

			<S.Body>
				{selectedSubmission ? (
					<>
						<S.HeaderStats>
							<S.StatItem>
								<S.StatLabel>Time:</S.StatLabel>
								<S.StatValue>
									{selectedSubmission.executionTime != null
										? `${selectedSubmission.executionTime} s`
										: "N/A"}
								</S.StatValue>
							</S.StatItem>
							<S.StatItem>
								<S.StatLabel>Memory:</S.StatLabel>
								<S.StatValue>
									{selectedSubmission.memoryUsage != null
										? `${selectedSubmission.memoryUsage} KB`
										: "N/A"}
								</S.StatValue>
							</S.StatItem>
							<S.StatItem>
								<S.StatLabel>Result:</S.StatLabel>
								<S.StatValue $success={selectedSubmission.result === "AC"}>
									{selectedSubmission.result}
								</S.StatValue>
							</S.StatItem>
							<S.StatItem>
								<S.StatLabel>Language:</S.StatLabel>
								<S.StatValue>{selectedSubmission.language ?? "—"}</S.StatValue>
							</S.StatItem>
						</S.HeaderStats>
						<S.CodeViewer>
							<pre>
								<code>{selectedSubmission.code ?? ""}</code>
							</pre>
						</S.CodeViewer>
					</>
				) : (
					<S.NoSelection>Select a submission to view details</S.NoSelection>
				)}
			</S.Body>
			<S.CloseButton type="button" onClick={onClose}>
				X
			</S.CloseButton>
		</S.Container>
	);
};

export default SubmissionHistory;
