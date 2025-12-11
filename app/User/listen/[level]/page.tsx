import { notFound } from "next/navigation";
import LessonGrid from "@/app/components/LessonGrid/page";
import type { Lesson } from "@/app/type/lesson";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";
import Link from "next/link";
import "@/app/globals.css";
const VALID_LEVELS = ["A1", "A2", "B1"];
const CURRENT_TOPIC = "listen";

interface PageProps {
  params: { level: string };
}

async function fetchLessons(level: string): Promise<Lesson[]> {
  const DUMMY_DATA: Lesson[] = [
    {
      id: 101,
      title: "Listen for Gist",
      description: "Beginner",
      level: "A1",
      imageURL: "/img/A1_Grammar.png",
    },
    {
      id: 102,
      title: "Hotel Booking Dialogue",
      description: "Simple conversation",
      level: "A1",
      imageURL: "/img/A1_Grammar.png",
    },
    {
      id: 201,
      title: "Understanding British Accents",
      description: "Intermediate",
      level: "A2",
      imageURL: "/img/A1_Grammar.png",
    },
  ];
  return DUMMY_DATA.filter(
    (l) => l.level.toUpperCase() === level.toUpperCase()
  );
}

export default async function ListeningLevelPage({ params }: PageProps) {
  const resolvedParams = await params;
  const level = resolvedParams.level;
  if (!level || !VALID_LEVELS.includes(level.toUpperCase())) notFound();

  const lessons = await fetchLessons(level.toUpperCase());

  return (
    <>
      {/* Header tối màu */}
      <MainHeader />
      {/* Banner Vàng */}
      <div className="header-banner">
        <div className="container">
          <h1 className="mb-0">{level} LISTENING TESTS</h1>
        </div>
      </div>
      <div className="container my-5">
        {/* Breadcrumb Navigation (Đặt ở vị trí nội dung chính) */}
        <div className="breadcrumb-nav mb-4">
          <Link href="/listen">Listening</Link>/ {level} Listening Tests
        </div>
        <p className="lead text-muted">Tổng cộng {lessons.length} bài học.</p>
        {/* Lesson Grid */}
        <LessonGrid lessons={lessons} />
      </div>
      {/* Footer tối màu */}
      <MainFooter />
    </>
  );
}

export async function generateStaticParams() {
  return VALID_LEVELS.map((level) => ({ level: level.toLowerCase() }));
}
