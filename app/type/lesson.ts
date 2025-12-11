export interface Lesson {
  id: number;
  title: string;
  description: string;
  level: "A1" | "A2" | "B1" | string;
  imageURL: string;
}

export interface LessonListPageProps {
  lessons: Lesson[];
  level: string;
  topic: string;
}
