import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import TutorLayout from "../../../../../layouts/TutorLayout";
import type { CodingTestDetailHookReturn } from "../hooks/useCodingTestDetail";
import * as S from "../styles";

export default function CodingTestDetailView(d: CodingTestDetailHookReturn) {
	if (d.loading) {
		return (
			<TutorLayout>
				<LoadingSpinner message="코딩 테스트 정보를 불러오는 중..." />
			</TutorLayout>
		);
	}

	if (!d.codingTest) {
		return (
			<TutorLayout>
				<S.Container>
					<S.Title>코딩 테스트를 찾을 수 없습니다</S.Title>
				</S.Container>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout>
			<S.Container>
				<S.Header>
					<S.BackButton onClick={() => d.navigate("/tutor/coding-tests")}>
						← 코딩 테스트 목록으로
					</S.BackButton>
					<S.Title>{d.codingTest.title}</S.Title>
				</S.Header>

				<S.InfoGrid>
					<S.InfoCard>
						<S.InfoLabel>시작 시간</S.InfoLabel>
						<S.InfoValue>{d.formatDate(d.codingTest.startTime)}</S.InfoValue>
					</S.InfoCard>
					<S.InfoCard>
						<S.InfoLabel>종료 시간</S.InfoLabel>
						<S.InfoValue>{d.formatDate(d.codingTest.endTime)}</S.InfoValue>
					</S.InfoCard>
					<S.InfoCard>
						<S.InfoLabel>참가자 수</S.InfoLabel>
						<S.InfoValue>
							{d.codingTest.participants?.length || 0}명
						</S.InfoValue>
					</S.InfoCard>
					<S.InfoCard>
						<S.InfoLabel>문제 수</S.InfoLabel>
						<S.InfoValue>{d.codingTest.problems?.length || 0}개</S.InfoValue>
					</S.InfoCard>
				</S.InfoGrid>

				<S.Section>
					<S.SectionTitle>문제 목록</S.SectionTitle>
					{d.codingTest.problems && d.codingTest.problems.length > 0 ? (
						<S.Table>
							<thead>
								<tr>
									<S.Th>번호</S.Th>
									<S.Th>제목</S.Th>
									<S.Th>난이도</S.Th>
								</tr>
							</thead>
							<tbody>
								{d.codingTest.problems!.map((problem, index) => (
									<tr key={problem.id}>
										<S.Td>{index + 1}</S.Td>
										<S.Td>{problem.title}</S.Td>
										<S.Td>
											<S.Badge
												style={{ background: "#f3f4f6", color: "#6b7280" }}
											>
												{problem.difficulty || "-"}
											</S.Badge>
										</S.Td>
									</tr>
								))}
							</tbody>
						</S.Table>
					) : (
						<p
							style={{
								color: "#9ca3af",
								textAlign: "center",
								padding: "2rem",
							}}
						>
							등록된 문제가 없습니다.
						</p>
					)}
				</S.Section>

				<S.Section>
					<S.SectionTitle>참가자 목록</S.SectionTitle>
					{d.codingTest.participants && d.codingTest.participants.length > 0 ? (
						<S.Table>
							<thead>
								<tr>
									<S.Th>이름</S.Th>
									<S.Th>학번</S.Th>
									<S.Th>점수</S.Th>
									<S.Th>상태</S.Th>
								</tr>
							</thead>
							<tbody>
								{d.codingTest.participants!.map((participant) => (
									<tr key={participant.userId}>
										<S.Td>{participant.userName}</S.Td>
										<S.Td>{participant.studentId || "-"}</S.Td>
										<S.Td>{participant.score || 0}점</S.Td>
										<S.Td>
											<S.Badge
												style={{
													background:
														participant.status === "COMPLETED"
															? "#d1fae5"
															: "#fef3c7",
													color:
														participant.status === "COMPLETED"
															? "#059669"
															: "#d97706",
												}}
											>
												{participant.status === "COMPLETED"
													? "완료"
													: participant.status === "IN_PROGRESS"
														? "진행중"
														: "미시작"}
											</S.Badge>
										</S.Td>
									</tr>
								))}
							</tbody>
						</S.Table>
					) : (
						<p
							style={{
								color: "#9ca3af",
								textAlign: "center",
								padding: "2rem",
							}}
						>
							참가자가 없습니다.
						</p>
					)}
				</S.Section>
			</S.Container>
		</TutorLayout>
	);
}
