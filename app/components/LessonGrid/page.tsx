"use client";

import React from "react";
import { Card, Tag } from "antd";
import Link from "next/link";

import type { Lesson } from "@/app/type/lesson";

const { Meta } = Card;

// --- 1. LESSON CARD ---
const LessonCard: React.FC<Lesson> = ({
  id,
  title,
  description,
  level,
  imageURL,
}) => {
  return (
    <Link href={`/lesson/${id}`} passHref>
      <Card
        hoverable
        style={{
          marginBottom: "20px",
          backgroundColor: "#fff",
          border: "1px solid #eee",
        }}
        cover={
          <div style={{ position: "relative" }}>
            <img
              alt={title}
              src={imageURL}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <Tag
              color="volcano"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: "14px",
              }}
            >
              {level}
            </Tag>
          </div>
        }
      >
        <Meta title={title} description={description} />
      </Card>
    </Link>
  );
};

// --- 2. LESSON GRID ---
interface LessonGridProps {
  lessons: Lesson[];
}

const LessonGrid: React.FC<LessonGridProps> = ({ lessons }) => {
  if (lessons.length === 0) {
    return <p>Không tìm thấy bài học nào.</p>;
  }

  return (
    <div className="row g-4">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <LessonCard {...lesson} />
        </div>
      ))}
    </div>
  );
};

export default LessonGrid;
