"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  SoundFilled,
  RightCircleFilled,
  LeftCircleFilled,
} from "@ant-design/icons";

import { motion, AnimatePresence } from "framer-motion";

export type VocabCardData = {
  id: number;
  word: string;
  pos: string;
  pron: string;
  meaningVn: string;
  exampleEn: string;
  exampleVn: string;
  audioUrl?: string;
};

interface FlashCardProps {
  data: VocabCardData[];
  imageUrl: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
  }),
};

export default function FlashCard({ data, imageUrl }: FlashCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [direction, setDirection] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setDirection(0);
    setIsFlipped(false);
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="text-center p-4">Chưa có dữ liệu.</div>;
  }

  const currentCard = data[currentIndex];
  const totalCards = data.length;

  const handleTurn = () => setIsFlipped(!isFlipped);

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current && currentCard.audioUrl) {
      audioRef.current.play();
    } else {
      const utterance = new SpeechSynthesisUtterance(currentCard.word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="flashcard-wrapper">
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "300px",
          margin: "0 auto",
          height: "620px",
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
          >
            <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
              <div className="flip-card-inner">
                <div className="flip-card-front card shadow-lg rounded-4 border-0">
                  <div className="card-header-img">
                    <img src={imageUrl} alt="Vocabulary Header" />
                  </div>
                  <div className="card-body-content">
                    <button
                      className="audio-btn shadow-sm"
                      onClick={handlePlayAudio}
                    >
                      <SoundFilled style={{ fontSize: "24px" }} />
                    </button>

                    <h2 className="vocab-word">{currentCard?.word ?? "--"}</h2>
                    <p className="vocab-type">({currentCard?.pos ?? "--"})</p>
                    <p className="vocab-phonetic">{currentCard?.pron}</p>

                    <audio ref={audioRef} src={currentCard?.audioUrl} />
                  </div>
                  <div className="card-footer-action">
                    <button
                      className="btn btn-primary px-5 rounded-pill fw-bold shadow-sm"
                      onClick={handleTurn}
                    >
                      Turn
                    </button>
                  </div>
                </div>

                <div className="flip-card-back card shadow-lg rounded-4 border-0">
                  <div className="card-header-img ">
                    <img src={imageUrl} alt="Header" />
                  </div>

                  <div className="card-body-content justify-content-center px-4">
                    <h3 className="text-primary fw-bold mb-3">
                      {currentCard.word}
                    </h3>

                    <div className="mb-3 w-100 text-center">
                      <p className="fs-5 mt-2 text-dark fw-medium">
                        {currentCard.meaningVn}
                      </p>
                    </div>

                    <div className="bg-light p-3 rounded w-100 border text-start">
                      <h6 className="text-muted text-uppercase small fw-bold mb-1">
                        Example:
                      </h6>
                      <p className="fst-italic mb-0 text-dark">
                        "{currentCard.exampleEn}"
                      </p>
                      <p className="fst-italic mb-0 text-dark">
                        "{currentCard.exampleVn}"
                      </p>
                    </div>
                  </div>

                  <div className="card-footer-action">
                    <button
                      className="btn btn-outline-primary px-5 rounded-pill fw-bold"
                      onClick={handleTurn}
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        style={{
          marginLeft: "160px",
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className="nav-control"
      >
        <span
          onClick={handlePrev}
          className={`nav-btn ${currentIndex === 0 ? "disabled" : ""}`}
        >
          <LeftCircleFilled style={{ fontSize: "42px", color: "#0d6efd" }} />
        </span>

        <span
          style={{ fontSize: "20px", margin: "15px 20px" }}
          className="text-muted  fw-bold user-select-none"
        >
          Card {currentIndex + 1} / {totalCards}
        </span>

        <span
          onClick={handleNext}
          className={`nav-btn ${
            currentIndex === totalCards - 1 ? "disabled" : ""
          }`}
        >
          <RightCircleFilled style={{ fontSize: "42px", color: "#0d6efd" }} />
        </span>
      </div>
      <style jsx>{`
        .flashcard-container {
          perspective: 1000px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 20px;
        }
        .card-header-img {
          height: 180px;
          width: 150px;
        }

        .flip-card {
          background-color: transparent;
          width: 210%;
          max-width: 300px;
          height: 620px;
          margin: 0 auto;
        }

        .flip-card-inner {
          position: relative;
          width: 210%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          left: -84px;
        }
        .card {
          width: 100%;
        }

        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          top: 0;
          left: 0;
          overflow: hidden;
          background: #fff;
          display: flex;
          flex-direction: column;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        .card-header-img {
          height: 220px;
          width: 100%;
          position: relative;
          background-color: #e0f2fe;
          flex-shrink: 0;
        }
        .card-header-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vocab-badge {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #104e7a;
          color: white;
          padding: 8px 30px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 1.2rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          border: 2px solid #fff;
          z-index: 5;
        }

        .card-body-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .card-body {
          align-items: center;
          justify-content: center;
        }

        .card-footer-action {
          padding-bottom: 30px;
          padding-top: 10px;
          background: #fff;
          flex-shrink: 0;
        }
        .text-muted {
          margin-bottom: 20px !important;
        }

        .audio-btn {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background-color: #0d6efd;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .audio-btn:hover {
          transform: scale(1.1);
        }
        .audio-btn:active {
          transform: scale(0.95);
        }

        .vocab-word {
          font-size: 2.5rem;
          font-weight: 800;
          color: #212529;
          margin-bottom: 0;
        }
        .vocab-type {
          font-size: 1.1rem;
          font-style: italic;
          color: #6c757d;
          margin-bottom: 5px;
        }
        .vocab-phonetic {
          font-size: 1.2rem;
          font-family: monospace;
          color: #000;
        }

        .nav-btn {
          cursor: pointer;
          transition: transform 0.2s;
        }
        .nav-btn:hover {
          transform: scale(1.2);
        }
        .nav-btn.disabled {
          opacity: 0.3;
          cursor: default;
          transform: none;
        }
      `}</style>
    </div>
  );
}
