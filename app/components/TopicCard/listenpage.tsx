"use client";

import React from "react";
import { useRouter } from "next/navigation";
interface TopicCardProps {
  id: number;
  name: string;
  description: string;
  level: string;
  imageUrl: string | null;
}

const TopicCard: React.FC<TopicCardProps> = ({
  id,
  name,
  description,
  level,
  imageUrl,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/User/listening/test?topicId=${id}`);
  };

  const defaultPlaceholderUrl = "/img/listen_A1.jpg";
  const finalImageUrl = imageUrl || defaultPlaceholderUrl;

  return (
    <div
      className="card shadow-sm h-100"
      onClick={handleClick}
      style={{
        borderRadius: "0.5rem",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.3s, transform 0.3s",
      }}
      // Thêm hiệu ứng hover (tùy chọn)
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0, 0, 0, 0.2)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow =
          "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image Area - Dùng background-image và cố định chiều cao */}
      <div
        className="position-relative"
        style={{
          height: "10rem", // Cố định chiều cao
          backgroundImage: `url(${finalImageUrl})`, // Dùng ảnh đã xử lý
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#ccc",
        }}
      >
        {/* Level Tag (Nền đen) */}
        <span
          className="badge position-absolute"
          style={{
            top: "0.5rem",
            right: "0.5rem",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {level}
        </span>

        <div
          className="position-absolute"
          style={{ bottom: "3rem", left: "0.5rem", zIndex: 10 }}
        ></div>

        {/* Text Overlay (Nền vàng) */}
        <div
          className="position-absolute w-100 text-center"
          style={{ bottom: 0, backgroundColor: "#ffc107", padding: "0.2rem 0" }}
        >
          <h3
            className="m-0 text-uppercase"
            style={{
              fontSize: "0.9rem",
              fontWeight: "bold",
              color: "#333", // Màu văn bản tối
            }}
          >
            {description}
          </h3>
        </div>

        {/* Site Branding (Có thể ẩn nếu không cần) */}
        <div
          className="position-absolute"
          style={{
            bottom: "0.2rem",
            right: "0.5rem",
            fontSize: "0.7rem",
            color: "#495057",
            fontWeight: "600",
            zIndex: 10,
          }}
        >
          {/* Ví dụ: Website Name */}
        </div>
      </div>

      {/* Footer Content - Phần miêu tả dưới ảnh */}
      <div className="card-body text-center p-3">
        <p
          className="card-text m-0"
          style={{ fontSize: "0.9rem", color: "#495057" }}
        >
          {name}
        </p>
      </div>
    </div>
  );
};

export default TopicCard;
