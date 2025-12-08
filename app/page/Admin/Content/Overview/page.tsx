"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import Head from 'next/head';
import { FaBars, FaBell, FaClipboardList, FaUserFriends, FaBook, FaStar } from 'react-icons/fa';
import React, { useState } from 'react';
// Đảm bảo đường dẫn này đúng:
import Sidebar from '../../../../components/sidebar/page'; 
import './overview.css'; // Import CSS riêng cho trang này

// --- Constants ---
const SIDEBAR_WIDTH = '240px'; 
const HEADER_HEIGHT = '60px';

// --- Interfaces ---
interface StatCardProps {
    value: string;
    label: string;
    change: string;
    icon: React.ElementType;
    iconBgClass: string;
}

interface ActivityItemProps {
    
    name: string;
    action: string;
    time: string;
    avatarBgClass: string;
}

// --- Header Component (Giữ nguyên) ---
const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
    <nav 
        className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm fixed-top" 
        style={{ height: HEADER_HEIGHT, zIndex: 1030 }} // Set chiều cao và Z-index cao
    >
        <div className="container-fluid">
            {/* Nút FaBars chỉ hiển thị trên màn hình nhỏ (d-lg-none) */}
            <FaBars className="fs-3 me-3 d-lg-block" style={{ cursor: 'pointer' }} onClick={onToggleSidebar} /> 
            
            <div className="navbar-brand text-dark fw-bold fs-5">Quản lý nội dung</div>
            
            <div className="d-flex align-items-center ms-auto">
                <FaBell className="text-secondary me-3 fs-5" style={{ cursor: 'pointer' }} />
                <div className="d-flex align-items-center">
                    <div className="me-2 text-end d-none d-sm-block">
                        <div className="fw-bold">Admin User</div>
                        <small className="text-muted">admin@doubleK.com</small>
                    </div>
                    <div className="bg-warning rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>A</div>
                </div>
            </div>
        </div>
    </nav>
);

// --- StatCard Component (Giữ nguyên) ---
const StatCard = ({ value, label, change, icon: Icon, iconBgClass }: StatCardProps) => (
    <div className="col-lg-3 col-md-6 mb-4">
      <div className="card h-100 border-0 shadow-sm p-3 position-relative d-flex">
        <div className="card-body d-flex justify-content-between align-items-center w-100">
          <div>
            <h3 className="card-title fw-bold mb-1" style={{ fontSize: '30px' }}>{value}</h3>
            <p className="card-text text-muted" style={{ fontSize: '15px' }}>{label}</p>
            <small className="text-success fw-bold">{change}</small>
          </div>
          <div className={`d-flex align-items-center justify-content-center rounded-circle ${iconBgClass}`} style={{ width: '60px', height: '60px', fontSize: '28px' }}>
            <Icon />
          </div>
        </div>
      </div>
    </div>
);

// --- ActivityItem Component (Giữ nguyên) ---
const ActivityItem = ({  name, action, time, avatarBgClass }: ActivityItemProps) => (
    <div className="d-flex align-items-start py-2 border-bottom" style={{ fontSize: "0.85rem" }}>
      <div className="flex-grow-1">
        <p className="mb-0" style={{ fontSize: "0.85rem", color: "#343a40" }}>
          <strong className="text-dark"style={{ fontSize: "1.5rem" }}>{name}</strong> {action}
        </p>
        <small className="text-muted" style={{ fontSize: "10px" }}>{time}</small>
      </div>
    </div>
);

// --- Main Page Component (ĐÃ CHỈNH SỬA) ---
export default function OverviewPage() {
    const [showSidebar, setShowSidebar] = useState(true); // Đặt mặc định là true để hiển thị

    // Dữ liệu mẫu (Giữ nguyên)
    const statsData: StatCardProps[] = [
        { value: '1,234', label: 'Tổng số bài học', change: '+12% so với tháng trước', icon: FaBook, iconBgClass: 'bg-stat-blue' },
        { value: '8,456', label: 'Người dùng hoạt động', change: '+23% so với tháng trước', icon: FaUserFriends, iconBgClass: 'bg-stat-green' },
        { value: '15,678', label: 'Bài kiểm tra hoàn thành', change: '+8% so với tháng trước', icon: FaClipboardList, iconBgClass: 'bg-stat-purple' },
        { value: '4.8/5', label: 'Đánh giá trung bình', change: '+0.3 so với tháng trước', icon: FaStar, iconBgClass: 'bg-stat-yellow' },
    ];

    const activities: ActivityItemProps[] = [
        { name: 'Nguyễn Văn A', action: 'đã hoàn thành bài kiểm tra Grammar B1', time: '5 phút trước', avatarBgClass: 'bg-activity-A' },
        { name: 'Trần Thị B', action: 'đã thêm bài học mới Vocabulary A2', time: '15 phút trước', avatarBgClass: 'bg-activity-B' },
        { name: 'Lê Văn C', action: 'đã cập nhật Listening B2', time: '1 giờ trước', avatarBgClass: 'bg-activity-C' },
    ];

    return (
        <>
            <Head><title>Quản lý nội dung - Overview</title></Head>
            
            {/* 🌟 1. SIDEBAR COMPONENT 🌟 */}
            <Sidebar show={showSidebar} /> 

            {/* 2. HEADER */}
            {/* Header cần truyền hàm toggle */}
            <Header onToggleSidebar={() => setShowSidebar(!showSidebar)} />

            {/* 🌟 3. MAIN CONTENT 🌟 */}
            <div 
                className="container-fluid" 
                style={{ 
                    paddingTop: HEADER_HEIGHT, // Đảm bảo nội dung không bị Header che
                    marginLeft: showSidebar ? SIDEBAR_WIDTH : '0', // Dịch chuyển nội dung chính
                    width: showSidebar ? `calc(100% - ${SIDEBAR_WIDTH})` : '100%', // Thu hẹp chiều rộng
                    transition: 'all 0.3s' // Hiệu ứng mượt mà
                }}
            >
                <div className="row px-3">
                    <div className="col-12 mb-4">
                        <h2 className="fw-bold">Tổng quan</h2>
                        <p className="text-muted">Chào mừng trở lại! Đây là tổng quan về hệ thống của bạn.</p>
                    </div>

                    <div className="row">
                        {statsData.map((stat, i) => <StatCard key={i} {...stat} />)}
                    </div>

                    <div className="row mt-3">
                        <div className="col-lg-8 mb-4">
                            <div className="card h-100 border-0 shadow-sm p-3">
                                <h3 className="card-header border-0 bg-white fw-bold">Thống kê truy cập</h3>
                                <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '320px' }}>
                                    <div className="d-flex align-items-end mb-3" style={{ height: '150px', width: '80%', borderBottom: '1px solid #dee2e6' }}>
                                        <div className="bg-primary mx-1" style={{ width: '15px', height: '20%' }}></div>
                                        <div className="bg-primary mx-1" style={{ width: '15px', height: '50%' }}></div>
                                        <div className="bg-primary mx-1" style={{ width: '15px', height: '80%' }}></div>
                                    </div>
                                    <p className="text-muted">Biểu đồ thống kê sẽ hiển thị ở đây</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 mb-4">
                            <div className="card h-100 border-0 shadow-sm p-3">
                                <h3 className="card-header border-0 bg-white fw-bold">Hoạt động gần đây</h3>
                                <div className="card-body pt-0">
                                    {activities.map((a, i) => <ActivityItem key={i} {...a} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}