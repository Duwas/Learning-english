"use client";

import React, { useState, useContext } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Typography,
  Tag,
  Divider,
} from "antd";
import { SwapOutlined, TranslationOutlined } from "@ant-design/icons";
import "./trans.css";
import MainFooter from "@/app/components/layout/Footer";
import MainHeader from "@/app/components/layout/Header";
import transAPI from "@/app/services/api/transAPI";
import { LoadingContext } from "@/app/context/LoadingContext";
import { useToast } from "@/app/hooks/useToast";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const languages = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
];

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU CHO KẾT QUẢ TRẢ VỀ
interface TranslationResponse {
  original: string;
  translated: string;
  target: string;
}

export default function TranslatePage() {
  const [sourceLang, setSourceLang] = useState<string>("en");
  const [targetLang, setTargetLang] = useState<string>("vi");
  const [inputText, setInputText] = useState<string>("");

  const [translationResult, setTranslationResult] =
    useState<TranslationResponse | null>(null);

  const { setLoading } = useContext(LoadingContext);
  const { showToast } = useToast();

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setTranslationResult(null);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);

    try {
       const res = (await transAPI.translate({
        text: inputText,
        source_lang: sourceLang,
        target_lang: targetLang,
      })) as TranslationResponse;

      setTranslationResult(res);
    } catch (err) {
      console.error(err);
      showToast("error", "Lỗi", "Chưa kết nối đến server !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MainHeader />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          background: "#f0f2f5",
        }}
        className="translate-page"
      >
        <Card
          className="translate-card"
          bordered={false}
          style={{
            width: "100%",
            maxWidth: 800,
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Title level={3} style={{ color: "#1890ff" }}>
              <TranslationOutlined style={{ marginRight: 10 }} />
              Translate
            </Title>
          </div>

          <Row gutter={16} align="middle" justify="center">
            <Col span={9}>
              <Select
                value={sourceLang}
                onChange={setSourceLang}
                size="large"
                style={{ width: "100%" }}
              >
                {languages.map((l) => (
                  <Option key={l.code} value={l.code}>
                    {l.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={2} style={{ textAlign: "center" }}>
              <Button
                shape="circle"
                icon={<SwapOutlined />}
                onClick={handleSwap}
                type="text"
                size="large"
              />
            </Col>
            <Col span={9}>
              <Select
                value={targetLang}
                onChange={setTargetLang}
                size="large"
                style={{ width: "100%" }}
              >
                {languages.map((l) => (
                  <Option key={l.code} value={l.code}>
                    {l.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <div style={{ marginTop: 24 }}>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              placeholder="Nhập văn bản cần dịch..."
              style={{ borderRadius: 8, fontSize: 16, padding: 12 }}
            />
          </div>

          <Button
            type="primary"
            block
            size="large"
            onClick={handleTranslate}
            disabled={!inputText}
            style={{
              marginTop: 24,
              height: 48,
              fontSize: 18,
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Dịch
          </Button>

          {/* Phần hiển thị kết quả */}
          {translationResult && translationResult.translated && (
            <div style={{ marginTop: 30 }}>
              <Divider>Kết quả</Divider>

              <div
                style={{
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: 8,
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Text
                  strong
                  style={{
                    fontSize: "18px",
                    color: "#389e0d",
                    marginRight: 10,
                  }}
                >
                  Trans :
                </Text>

                <Text
                  style={{
                    fontSize: "22px",
                    fontWeight: 500,
                    color: "#000",
                    marginRight: 10,
                  }}
                >
                  {translationResult.translated}
                </Text>

                <Tag
                  color="blue"
                  style={{
                    fontSize: "14px",
                    padding: "4px 10px",
                    borderRadius: 12,
                  }}
                >
                  {translationResult.target || targetLang}
                </Tag>
              </div>
            </div>
          )}
        </Card>
      </div>
      <MainFooter />
    </>
  );
}
