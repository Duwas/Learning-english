"use client";
import { Layout } from "antd";
import MainHeader from "./components/layout/Header";
import "./CSS/main-menu.css";
import MainFooter from "./components/layout/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
// import {Button} from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import LessonCard from "./components/courseItem/LessonCard";
import { useRouter } from "next/router";
import IpaTable from "./components/IpaTable/IpaTable";

const cardData = [
  {
    img: { src: "/img/Grammar_bg.jpg" }, // Đảm bảo bạn có ảnh này trong thư mục public/images
    title: "Grammar Lessons",
    text: "Study the grammar lessons that are typically included in each level: A1, A2, B1, B1+, B2. There are three or more exercises and an explanation in each lesson, and feedback for every single question!",
    buttonLabel: "Go to the lessons",
    buttonLink: "/User/LessonGrammarCard",
    colorClass: "blue",
  },
  {
    img: { src: "/img/Vocabulary_bg.jpg" },
    title: "Vocabulary Lessons",
    text: "Boost your vocabulary with exercises tailored for each level: A1, A2, B1, B1+, B2. Every lesson features keywords, definitions, pictures and quizzes with personalized feedback to enhance your learning.",
    buttonLabel: "Go to the lessons",
    buttonLink: "/User/LessonVocabCard",
    colorClass: "pink",
  },
];

const { Content } = Layout;
export default function Home() {
  return (
    <>
      <MainHeader />
      <div className="hero position-relative">
        <img
          src="/img/home-bg.jpg"
          alt="Home Background"
          className="img-fluid w-100"
        />

        <div className="text-home position-absolute top-50 start-50 translate-middle text-center text-white px-3">
          <h1 className="display-4">Test-English</h1>
          <strong className="fs-2 text-success">
            Take your learning with you!
          </strong>
          <p className="fs-5">
            Grammar lessons with exercises and clear explanations, grammar
            charts, reading and listening tests with transcriptions, writing
            lessons, instant marking, answer feedback, and much more!
          </p>
        </div>
      </div>
      <div className="ques">
        <p id="a">
          What would you like to <span id="b"> learn </span> today?
        </p>
      </div>
      {/* PHẦN HIỂN THỊ CÁC CARD MỚI */}
      <div className="container my-5">
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {cardData.map((data, index) => (
            <div className="col" key={index}>
              <LessonCard
                img={data.img}
                title={data.title}
                text={data.text}
                buttonLabel={data.buttonLabel}
                buttonLink={data.buttonLink}
                colorClass={data.colorClass}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="container my-5">
        <IpaTable />
      </div>
      <MainFooter />
    </>
  );
}
