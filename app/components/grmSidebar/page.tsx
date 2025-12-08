'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';

export interface GrmPartItem { id: number; title: string; } 
export interface GrmSidebarProps { data: GrmTopicData[]; } 
export interface GrmTopicData { topic_id: number; topic_name: string; group_words: GrmPartItem[]; }

// Component con: Hiển thị 1 Topic
const SingleGrmTopic = ({ topic, activePartId }: { topic: GrmTopicData, activePartId: string | null }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-2">

      {/* HEADER TOPIC */}
      <div 
        className="d-flex align-items-center p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: '#fff',
          gap: '40px'
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#0d6efd', textTransform: 'uppercase' }}>
          {topic.topic_name}
        </span>

        <span style={{ fontSize: '12px', color: '#6c757d' }}>
          {isOpen ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </span>
      </div>

      {/* DANH SÁCH PART CON */}
      {isOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            paddingLeft: '10px',
            marginLeft: '10px',
            borderLeft: '2px solid #d1cece',
            marginTop: '5px'
            // Đã bỏ max-height ở đây để nội dung tràn tự nhiên trong Sidebar cha
          }}
        >
          {topic.group_words.map((part) => {
            
            const id = part.id;
            const displayLabel = `${part.title}`;
            const isActive = activePartId === id.toString();

            return (
              <Link
                key={id}
                href={`?part=${id}`}
                className="part-item"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '8px 20px',
                  borderRadius: '50px',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  
                  backgroundColor: isActive ? '#fff3cd' : 'transparent',
                  color: isActive ? '#856404' : '#495057',
                  fontWeight: isActive ? '700' : '500',
                  boxShadow: isActive ? '0 4px 6px rgba(0,0,0,0.2)' : 'none',
                  borderLeft: isActive ? '4px solid #ffc107' : '4px solid transparent',
                  transform: isActive ? 'translateX(5px)' : 'none'
                }}
              >
                {displayLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Component chính
export default function GrmSidebar({ data }: GrmSidebarProps) {
  const searchParams = useSearchParams();
  const activePartId = searchParams.get('part');

  return (
    <div
      className="sidebar-scroll-container" // Class cho scrollbar
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        padding: '15px',
        border: '1px solid #eee',

        // --- CẤU HÌNH QUAN TRỌNG ĐỂ SCROLL SIDEBAR ---
        position: 'sticky',           // Giúp sidebar đứng yên khi cuộn trang chính
        top: '100px',                 // Cách mép trên màn hình 100px (để chừa chỗ cho Header)
        maxHeight: 'calc(100vh - 120px)', // Chiều cao tối đa = Chiều cao màn hình - khoảng cách trên/dưới
        overflowY: 'auto',            // Nếu nội dung dài hơn maxHeight -> hiện thanh cuộn dọc
        paddingRight: '5px'           // Chừa chỗ cho thanh scrollbar
        // ---------------------------------------------
      }}
    >
      {data.map((topic) => (
        <SingleGrmTopic 
          key={topic.topic_id}
          topic={topic}
          activePartId={activePartId}
        />
      ))}

      <style jsx>{`
        .part-item:hover {
          background-color: #f8f9fa !important;
        }
        .part-item[style*="background-color: #ffc107"]:hover {
          background-color: #ffc107 !important;
          opacity: 0.9;
        }

        /* --- TÙY CHỈNH THANH CUỘN (SCROLLBAR) --- */
        .sidebar-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 4px;
        }
        .sidebar-scroll-container::-webkit-scrollbar-thumb {
          background: #c1c1c1; 
          border-radius: 4px;
        }
        .sidebar-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8; 
        }
      `}</style>
    </div>
  );
}