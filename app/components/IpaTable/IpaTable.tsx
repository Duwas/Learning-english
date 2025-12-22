"use client";
import React from "react";

// ====================== CẤU HÌNH DATA ======================

// Bảng map giúp trình duyệt đọc được các ký tự lạ
// (Trình duyệt không biết đọc 'θ', nên ta bảo nó đọc từ 'thin' hoặc âm tương tự)
const TTS_MAP: Record<string, string> = {
  // Vowels
  iː: "ee", // Kéo dài âm e
  ɪ: "it", // Âm ngắn
  e: "bed",
  æ: "at",
  ɑː: "car",
  ɒ: "hot",
  ɔː: "or",
  ʊ: "u",
  uː: "u",
  ʌ: "up",
  ɜː: "ơ",
  ə: "ô",

  // Consonants (Một số ký tự trình duyệt đọc được, một số thì không)
  θ: "ee",
  ð: "this",
  ʃ: "she",
  ʒ: "vision",
  tʃ: "chair",
  dʒ: "job",
  ŋ: "sing",
  j: "yes",
};

const IPA_TABLE = [
  {
    type: "Vowels",
    items: [
      { symbol: "iː", example: "see", exampleIpa: "/siː/" },
      { symbol: "ɪ", example: "sit", exampleIpa: "/sɪt/" },
      { symbol: "e", example: "ten", exampleIpa: "/ten/" },
      { symbol: "æ", example: "cat", exampleIpa: "/kæt/" },
      { symbol: "ɑː", example: "car", exampleIpa: "/kɑː/" },
      { symbol: "ɒ", example: "hot", exampleIpa: "/hɒt/" },
      { symbol: "ɔː", example: "law", exampleIpa: "/lɔː/" },
      { symbol: "ʊ", example: "put", exampleIpa: "/pʊt/" },
      { symbol: "uː", example: "food", exampleIpa: "/fuːd/" },
      { symbol: "ʌ", example: "cup", exampleIpa: "/kʌp/" },
      { symbol: "ɜː", example: "bird", exampleIpa: "/bɜːd/" },
      { symbol: "ə", example: "sofa", exampleIpa: "/ˈsəʊfə/" },
    ],
  },
  {
    type: "Consonants",
    items: [
      { symbol: "p", example: "pen", exampleIpa: "/pen/" },
      { symbol: "b", example: "bat", exampleIpa: "/bæt/" },
      { symbol: "t", example: "top", exampleIpa: "/tɒp/" },
      { symbol: "d", example: "dog", exampleIpa: "/dɒg/" },
      { symbol: "k", example: "cat", exampleIpa: "/kæt/" },
      { symbol: "g", example: "go", exampleIpa: "/gəʊ/" },
      { symbol: "f", example: "fan", exampleIpa: "/fæn/" },
      { symbol: "v", example: "van", exampleIpa: "/væn/" },
      { symbol: "θ", example: "thin", exampleIpa: "/θɪn/" },
      { symbol: "ð", example: "this", exampleIpa: "/ðɪs/" },
      { symbol: "s", example: "sun", exampleIpa: "/sʌn/" },
      { symbol: "z", example: "zoo", exampleIpa: "/zuː/" },
      { symbol: "ʃ", example: "she", exampleIpa: "/ʃiː/" },
      { symbol: "ʒ", example: "measure", exampleIpa: "/ˈmɛʒər/" },
      { symbol: "tʃ", example: "chair", exampleIpa: "/tʃeər/" },
      { symbol: "dʒ", example: "judge", exampleIpa: "/dʒʌdʒ/" },
      { symbol: "m", example: "man", exampleIpa: "/mæn/" },
      { symbol: "n", example: "no", exampleIpa: "/nəʊ/" },
      { symbol: "ŋ", example: "sing", exampleIpa: "/sɪŋ/" },
      { symbol: "h", example: "hot", exampleIpa: "/hɒt/" },
      { symbol: "l", example: "let", exampleIpa: "/lɛt/" },
      { symbol: "r", example: "red", exampleIpa: "/rɛd/" },
      { symbol: "j", example: "yes", exampleIpa: "/jɛs/" },
      { symbol: "w", example: "we", exampleIpa: "/wiː/" },
    ],
  },
];

// ====================== XỬ LÝ GIỌNG NÓI ======================

const speak = (text: string, voiceLang: string = "en-US") => {
  const synth = window.speechSynthesis;
  if (!synth) {
    alert("Trình duyệt không hỗ trợ SpeechSynthesis.");
    return;
  }

  synth.cancel(); // Dừng âm thanh đang đọc dở (nếu có)

  // KEY FIX: Kiểm tra xem text có nằm trong bảng map TTS_MAP không
  // Nếu có thì đọc giá trị thay thế, nếu không thì đọc nguyên gốc
  const textToSpeak = TTS_MAP[text] || text;

  const utter = new SpeechSynthesisUtterance(textToSpeak);
  utter.lang = voiceLang;
  utter.rate = 0.8; // Tốc độ đọc (0.8 là vừa phải để nghe rõ âm)

  // Cố gắng chọn giọng chuẩn tiếng Anh (Google US hoặc Microsoft David/Zira)
  const voices = synth.getVoices();
  if (voices.length > 0) {
    const preferredVoice =
      voices.find(
        (v) => v.lang === "en-US" && !v.name.includes("Google") // Ưu tiên giọng native system nếu có
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) utter.voice = preferredVoice;
  }

  synth.speak(utter);
};

// ====================== COMPONENT ======================

export default function IpaTable() {
  return (
    <div className="container my-5" style={{ fontFamily: "Arial, sans-serif" }}>
      <h2 className="text-center mb-5" style={{ color: "#333" }}>
        English IPA Chart
      </h2>

      {IPA_TABLE.map((group) => (
        <div key={group.type} className="mb-5">
          <h4
            className="mb-3"
            style={{
              borderBottom: "2px solid #0070f3",
              display: "inline-block",
              paddingBottom: "5px",
            }}
          >
            {group.type}
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "16px",
            }}
          >
            {group.items.map((item) => (
              <div
                key={item.symbol}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                }}
                // Hiệu ứng hover đơn giản
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 12px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px rgba(0,0,0,0.05)";
                }}
              >
                {/* Phần Symbol IPA */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "bold",
                      color: "#0070f3",
                    }}
                  >
                    {item.symbol}
                  </span>
                  <button
                    onClick={() => speak(item.symbol)}
                    title="Listen to sound"
                    style={{
                      cursor: "pointer",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: "#e7f5ff",
                      color: "#0070f3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                    }}
                  >
                    🔊
                  </button>
                </div>

                {/* Phần Ví dụ */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "1rem", fontWeight: "500" }}>
                      {item.example}
                    </span>
                    <button
                      onClick={() => speak(item.example)}
                      title={`Listen to "${item.example}"`}
                      style={{
                        cursor: "pointer",
                        border: "none",
                        background: "transparent",
                        fontSize: "0.9rem",
                      }}
                    >
                      🔈
                    </button>
                  </div>
                  <span style={{ fontSize: "0.85rem", color: "#888" }}>
                    {item.exampleIpa}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
