import React from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

const PRIMARY_COLOR = "#ff6b81"; 
const ACCENT_COLOR = "#ffe5e5";
const TEXT_OVERLAY_COLOR = "#ff6b81"; 

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
      
      style={{
        borderRadius: "0.5rem",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.3s, box-shadow 0.3s",
        border: `1px solid ${ACCENT_COLOR}`,
      }}
      
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

        <div
          className="position-absolute w-100 text-center"
          style={{
            bottom: 0,
            backgroundColor: TEXT_OVERLAY_COLOR, 
            padding: "0.5rem 0.5rem",
            boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",
          }}
        >
          <h3
            className="m-0 text-truncate" 
            style={{
              fontSize: "1rem",
              fontWeight: "900",
              color: "white",
            }}
          >
            {name} 
          </h3>
        </div>
      </div>

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
            WebkitLineClamp: 3, 
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
