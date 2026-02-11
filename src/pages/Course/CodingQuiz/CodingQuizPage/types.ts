export interface Quiz {
  id: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: "WAITING" | "ACTIVE" | "ENDED";
  problemCount: number;
  active?: boolean;
}

export type ProblemStatus = "ACCEPTED" | "SUBMITTED" | "NOT_SUBMITTED";

export interface Problem {
  id: number;
  title: string;
  order: number;
  status?: ProblemStatus;
}

export interface SectionInfo {
  id: number;
  courseTitle?: string;
  courseName?: string;
}
