// app/components/LessonCard/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Lesson } from "@/app/type/lesson";
import "@/app/globals.css";

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const { title, level, description, imageURL } = lesson;
  const lessonSlug = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const href = `/listen/${level.toLowerCase()}/${lessonSlug}`;
  const defaultImage = "/img/default_placeholder.png";

  return (
    <Link
      href={href}
      className="lesson-card-wrapper" /* Sử dụng class global mới */
    >
      {/* Image Cover */}
      <div className="lesson-card-cover">
        <Image
          src={imageURL || defaultImage}
          alt={title}
          width={280} // Chiều rộng tối đa của card
          height={160}
          style={{ objectFit: "cover" }}
        />

        {/* Level Tag (A1) */}
        <div className="badge-level-small">{level}</div>
      </div>

      {/* Content Box */}
      <div className="lesson-card-content">
        <h5>{title}</h5>
        <p className="mb-0">{description}</p>
      </div>
    </Link>
  );
}
