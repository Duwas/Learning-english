import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 1. Nhập các Component Trang Quản Trị chính (Thường là các danh sách)
// Giả định mỗi thư mục Content có một component chính, ví dụ: GrammarManagement
import GrammarManagement from '../Content/Grammar';
import ListenManagement from '../Content/Listen';
import OverviewDashboard from '../Content/Overview'; // Trang tổng quan
import ReadingManagement from '../Content/Reading';
import VocabularyManagement from '../Content/Vocabulary';
import WritingManagement from '../Content/Writing';

// Giả định có một Layout chung cho khu vực Admin
import Sidebar from '../../../../components/sidebar/page'; 

const AdminRoutes = () => {
  return (
    // AdminLayout cung cấp cấu trúc chung (như thanh điều hướng, sidebar)
    <Routes element={<Sidebar />}> 
      
      {/* Đường dẫn mặc định khi truy cập /admin */}
      <Route path="/" element={<OverviewDashboard />} /> 
      
      {/* 2. Định tuyến cho các Module Nội dung */}
      
      {/* Quản lý Ngữ pháp: /admin/grammar */}
      <Route path="grammar" element={<GrammarManagement />} /> 
     
      {/* Quản lý Nghe: /admin/listen */}
      <Route path="listen" element={<ListenManagement />} /> 
      {/* <Route path="listen/edit/:id" element={<ListenDetail />} /> */}
      
      {/* Quản lý Đọc: /admin/reading */}
      <Route path="reading" element={<ReadingManagement />} />
      
      {/* Quản lý Từ vựng: /admin/vocabulary */}
      <Route path="vocabulary" element={<VocabularyManagement />} />
      
      {/* Quản lý Viết: /admin/writing */}
      <Route path="writing" element={<WritingManagement />} />

      {/* 3. Xử lý Lỗi (Optional): Dùng cho các đường dẫn không tồn tại trong Admin */}
      {/* <Route path="*" element={<NotFoundAdmin />} /> */}

    </Routes>
  );
};

export default AdminRoutes;