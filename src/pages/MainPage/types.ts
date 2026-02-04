export interface Section {
  sectionId: number;
  courseId: number;
  courseTitle: string;
  sectionNumber: number;
  instructorName: string;
  active: boolean;
  newNoticeCount: number;
  newAssignmentCount: number;
}

export interface CourseCardData {
  id: number;
  title: string;
  subtitle: string;
  batch: string;
  courseName: string;
  status: StatusItem[];
  instructor: string;
  color: string;
  sectionId: number;
  courseId: number;
  active: boolean;
}

export interface StatusItem {
  type: string;
  text: string;
  color: string;
}
