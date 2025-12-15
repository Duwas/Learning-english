"use client";
import React from "react";

// ====================== DATA IPA ======================
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

// ====================== TTS FUNCTION ======================
const speak = (text: string, voiceLang: string = "en-US") => {
  const synth = window.speechSynthesis;
  if (!synth) {
    alert("Trình duyệt của bạn không hỗ trợ SpeechSynthesis.");
    return;
  }
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = voiceLang;
  utter.rate = 0.6;
  const voices = synth.getVoices();
  if (voices && voices.length) {
    const match = voices.find((v) =>
      v.lang.toLowerCase().startsWith(voiceLang.slice(0, 2).toLowerCase())
    );
    if (match) utter.voice = match;
  }
  synth.speak(utter);
};

// ====================== COMPONENT ======================
export default function IpaTable() {
  return (
    <div className="container my-5">
      <h2 className="text-center mb-5">English IPA Chart</h2>

      {IPA_TABLE.map((group) => (
        <div key={group.type} className="mb-5">
          <h4 className="mb-3">{group.type}</h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "12px",
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
                  padding: "12px",
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {item.symbol}
                  <button
                    onClick={() => speak(item.symbol)}
                    style={{
                      cursor: "pointer",
                      padding: "2px 6px",
                      fontSize: "0.8rem",
                      borderRadius: "6px",
                      border: "1px solid #aaa",
                      background: "#f0f0f0",
                    }}
                  >
                    🔊
                  </button>
                </div>

                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#555",
                    marginBottom: "6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>{item.example}</span>
                  <span style={{ color: "#888" }}>{item.exampleIpa}</span>
                  <button
                    onClick={() => speak(item.example)}
                    style={{
                      cursor: "pointer",
                      padding: "2px 6px",
                      fontSize: "0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #aaa",
                      background: "#f0f0f0",
                    }}
                  >
                    🔊
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
