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

export interface Problem {
  id: number;
  title: string;
  order: number;
}

export interface SectionInfo {
  id: number;
  courseTitle?: string;
  courseName?: string;
}
