import React from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

const PRIMARY_COLOR = "#ff6b81"; // Màu hồng đậm/Coral
const ACCENT_COLOR = "#ffe5e5";
const TEXT_OVERLAY_COLOR = "#ff6b81"; // Màu Coral/Hồng đậm (Dùng cho dải tiêu đề chính)

interface TopicCardProps {
  id: number;
  name: string;
  description: string;
  level: string;
  imageUrl: string | null;
}
const SpeakingTopicCard: React.FC<TopicCardProps> = ({
  id,
  name,
  description,
  level,
  imageUrl,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/User/speaking/test?topicId=${id}`);
  };

  const defaultPlaceholderUrl = "/img/speaking_A1.jpg";
  const finalImageUrl = imageUrl || defaultPlaceholderUrl;

  return (
    <div
      onClick={handleClick}
      className="card shadow-sm h-100"
      // Thêm hiệu ứng hover vào style
      style={{
        borderRadius: "0.5rem",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.3s, box-shadow 0.3s",
        border: `1px solid ${ACCENT_COLOR}`,
      }}
      // Hiệu ứng Hover: Nâng thẻ lên và đổ bóng mạnh hơn
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 1rem 3rem rgba(0, 0, 0, 0.175)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 .125rem .25rem rgba(0, 0, 0, .075)";
      }}
    >
      {/* 1. Image Area & Level Tag */}
      <div
        className="position-relative"
        style={{
          height: "10rem",
          backgroundImage: `url(${finalImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: ACCENT_COLOR,
        }}
      >
        {/* Level Tag */}
        <span
          className="badge position-absolute bg-dark"
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

        {/* Name Overlay - Dải tiêu đề chính (Lúc trước là description) */}
        <div
          className="position-absolute w-100 text-center"
          style={{
            bottom: 0,
            backgroundColor: TEXT_OVERLAY_COLOR, // Màu hồng đậm
            padding: "0.5rem 0.5rem",
            boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",
          }}
        >
          <h3
            className="m-0 text-truncate" // Dùng text-truncate để xử lý tên dài
            style={{
              fontSize: "1rem",
              fontWeight: "900",
              color: "white",
            }}
          >
            {name} {/* Hiển thị Tên Chủ đề ở đây */}
          </h3>
        </div>
      </div>

      {/* 2. Footer Content - Phần miêu tả dưới ảnh */}
      <div className="card-body p-3">
        <p
          className="card-text mb-1"
          style={{
            fontSize: "0.85rem",
            color: PRIMARY_COLOR,
            fontWeight: "600",
          }}
        >
          Mô tả:
        </p>
        <p
          className="card-text text-start m-0 text-muted"
          style={{
            fontSize: "0.9rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3, // Giới hạn 3 dòng
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default SpeakingTopicCard;
