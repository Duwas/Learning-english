'use client';

import React, { useState, useContext } from 'react';
import { Row, Col, Card, Input, Select, Button, Typography } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import './trans.css'; // File CSS riêng
import MainFooter from '@/app/components/layout/Footer';
import MainHeader from '@/app/components/layout/Header';
import transAPI from '@/app/services/api/transAPI';
import { LoadingContext } from "@/app/context/LoadingContext";
import { useToast } from '@/app/hooks/useToast';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const languages = [
  { code: 'en', label: 'English ' },
  { code: 'vi', label: 'Tiếng Việt ' },
];

export default function TranslatePage() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('vi');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const { loading, setLoading } = useContext(LoadingContext);
  const { showToast } = useToast();
  
  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setTranslatedText('');
  };

  const handleTranslate = async () => {
    if (!inputText) return;
    setLoading(true);

    try {
      const res = await transAPI.translate({
        text: inputText,
        source_lang: sourceLang,
        target_lang: targetLang
      });

      setTranslatedText(res.translated_text || '');
    } catch (err) {
      console.error(err);
       showToast('error', 'Lỗi', 'Chưa kết nối đến server !'); 
    } finally {
      setLoading();
    }
  };

  return (
    <>
    <MainHeader />
    <div  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="translate-page">
      <Card className="translate-card">
        <Title level={3}>Translate</Title>

        {/* Language selector + swap */}
        <Row gutter={16} align="middle" className="mt-4">
          <Col flex="1">
            <Select
              value={sourceLang}
              onChange={setSourceLang}
              className="language-select"
            >
              {languages.map(l => <Option key={l.code} value={l.code}>{l.label}</Option>)}
            </Select>
          </Col>
          <Col>
            <Button style={{background:'greenyellow'}} icon={<SwapOutlined />} onClick={handleSwap} className="swap-button"/>
          </Col>
          <Col flex="1">
            <Select
              value={targetLang}
              onChange={setTargetLang}
              className="language-select"
            >
              {languages.map(l => <Option key={l.code} value={l.code}>{l.label}</Option>)}
            </Select>
          </Col>
        </Row>

        {/* Input */}
        <TextArea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          rows={4}
          placeholder="Nhập văn bản cần dịch..."
          className="translate-input mt-4"
        />

        {/* Translate Button */}
        <Button
          type="primary"
          block
          onClick={handleTranslate}
          className="translate-button mt-2"
          disabled={!inputText}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          Dịch
        </Button>

        {/* Output */}
        {translatedText && (
          <Card className="translate-output">
            <Text strong>Kết quả:</Text>
            <Text style={{ display: 'block', marginTop: 8 }}>{translatedText}</Text>
          </Card>
        )}
      </Card>
    </div>
    <MainFooter />
    </>
  );
};

// export default TranslatePage;
