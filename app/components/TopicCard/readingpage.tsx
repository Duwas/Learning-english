import React from "react";
import { useRouter } from "next/navigation";
interface TopicCardProps {
  id: number;
  name: string;
  description: string;
  level: string;
  imageUrl: string | null;
}

// Định nghĩa màu sắc chủ đạo
const PRIMARY_COLOR = "#446acbff"; // Màu xanh
const ACCENT_COLOR = "#ffe5e5"; // Màu hồng nhạt

const ReadingTopicCard: React.FC<TopicCardProps> = ({
  id,
  name,
  description,
  level,
  imageUrl,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/User/reading/test?topicId=${id}`);
  };
  const defaultPlaceholderUrl = "/img/reading_A1.png"; // Dùng ảnh placeholder khác cho Speaking
  const finalImageUrl = imageUrl || defaultPlaceholderUrl;

  return (
    // Sử dụng card Bootstrap
    <div
      className="card shadow-sm h-100"
      onClick={handleClick}
      style={{
        borderRadius: "0.5rem",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.3s",
      }}
    >
      {/* Image Area - Dùng background-image và cố định chiều cao */}
      <div
        className="position-relative"
        style={{
          height: "10rem",
          backgroundImage: `url(${finalImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: ACCENT_COLOR, // Nền xám/hồng nhạt
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
          // Căn chỉnh ngay trên thanh nền
          style={{ bottom: "1.7rem", left: "0.5rem", zIndex: 10 }}
        ></div>

        {/* Text Overlay (Nền hồng chủ đạo) */}
        <div
          className="position-absolute w-100 text-center"
          style={{
            bottom: 0,
            backgroundColor: PRIMARY_COLOR,
            padding: "0.2rem 0",
          }} // Dùng màu hồng đậm
        >
          <h3
            className="m-0 text-uppercase"
            style={{
              fontSize: "0.9rem",
              fontWeight: "bold",
              color: "white", // Chữ màu trắng nổi bật trên nền hồng
            }}
          >
            {description}
          </h3>
        </div>

        {/* Site Branding */}
        <div
          className="position-absolute"
          style={{
            bottom: "0.2rem",
            right: "0.5rem",
            fontSize: "0.7rem",
            color: "white", // Chữ màu trắng nổi bật trên nền hồng
            fontWeight: "600",
            zIndex: 10,
          }}
        ></div>
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

export default ReadingTopicCard;
