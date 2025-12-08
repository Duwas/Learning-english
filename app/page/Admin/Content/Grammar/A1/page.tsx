"use client";

import Head from 'next/head';
import React, { useState } from 'react'; // Bắt buộc phải có useState và "use client"
import { FaBell, FaSearch, FaEye, FaPencilAlt, FaTrashAlt, FaPlus, FaFilter, FaBars } from 'react-icons/fa';
import './A1.css'; // Import CSS riêng cho trang này
// Import Sidebar của bạn. Cần đảm bảo đường dẫn chính xác.
import Sidebar from '../../../../../components/sidebar/page';

// --- Định nghĩa Hằng số (Phải định nghĩa nếu dùng) ---
const SIDEBAR_WIDTH = '240px'; 
const HEADER_HEIGHT = '60px'; 

// --- Interfaces (Nếu bạn đang dùng TypeScript) ---
interface StatusBadgeProps {
    status: string;
}

interface ContentManagementPageProps {
    // Nếu có props truyền từ layout, định nghĩa ở đây
}

// --- Dữ liệu mẫu cho bảng ---
const lessonData = [
    { title: 'Present Simple Tense', description: 'Học cách sử dụng thì hiện tại đơn trong tiếng Anh', status: 'Đã xuất bản', views: 1234, updated: '2024-01-15' },
    { title: 'Past Continuous', description: 'Thì quá khứ tiếp diễn và cách sử dụng', status: 'Bản nháp', views: 856, updated: '2024-01-14' },
    { title: 'Future Perfect', description: 'Tìm hiểu về thì tương lai hoàn thành', status: 'Đã xuất bản', views: 2341, updated: '2024-01-13' },
    { title: 'Modal Verbs', description: 'Động từ khuyết thiếu và cách dùng', status: 'Đã xuất bản', views: 1876, updated: '2024-01-12' },
    { title: 'Conditional Sentences', description: 'Câu điều kiện loại 1, 2, 3', status: 'Bản nháp', views: 654, updated: '2024-01-11' },
    { title: 'Passive Voice', description: 'Câu bị động trong tiếng Anh', status: 'Đã xuất bản', views: 1543, updated: '2024-01-10' },
];

// --- Component StatusBadge (Đã sửa lỗi TypeScript) ---
const StatusBadge = ({ status }: StatusBadgeProps) => {
    let badgeClass = '';
    if (status === 'Đã xuất bản') {
        badgeClass = 'badge-success-green';
    } else if (status === 'Bản nháp') {
        badgeClass = 'badge-warning-yellow';
    }

    return <span style={{ color: 'black' }} className={`badge ${badgeClass}`}>{status}</span>;
};

// --- Component Header (ĐÃ SỬA để chứa nút toggle) ---
const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
    const adminUser = { name: "Admin User", email: "admin@test-english.com" };

    return (
        <header 
            className="navbar navbar-light bg-white border-bottom shadow-sm fixed-top" 
            style={{ height: HEADER_HEIGHT, zIndex: 1030 }}
        >
            <div className="d-flex justify-content-between align-items-center container-fluid px-lg-4 px-md-3">
                
                {/* 🌟 Nút FaBars để ẩn/hiện Sidebar 🌟 */}
                <FaBars 
                    className="fs-4 me-3" 
                    style={{ cursor: 'pointer' }} 
                    onClick={onToggleSidebar} 
                />
                
                <div className="fs-5 fw-bold text-dark">Quản lý nội dung</div>
                
                <div className="d-flex align-items-center ms-auto">
                    <FaBell className="text-secondary me-3 fs-5" style={{ cursor: 'pointer' }} />
                    <div className="d-flex align-items-center">
                        <div className="me-2 text-end d-none d-sm-block">
                            <div className="fw-bold">{adminUser.name}</div>
                            <small className="text-muted">{adminUser.email}</small>
                        </div>
                        <div className="bg-warning rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>A</div>
                    </div>
                </div>
            </div>
        </header>
    );
};


// --- Component chính cho trang Ngữ pháp A1 ---
export default function ContentManagementPage({}: ContentManagementPageProps) {
    
    // 🌟 LOGIC ẨN/HIỆN SIDEBAR 🌟
    const [showSidebar, setShowSidebar] = useState(true);

    const handleToggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };
    // ------------------------------------

    return (
        <>
            <Head>
                <title>Ngữ pháp - A1 Sơ cấp</title>
            </Head>

            {/* 1. SIDEBAR */}
            {/* Tên prop phải khớp với định nghĩa trong Sidebar của bạn (là 'show') */}
            <Sidebar show={showSidebar} /> 

            {/* 2. HEADER */}
            <Header onToggleSidebar={handleToggleSidebar} />

            {/* 3. MAIN CONTENT (ĐÃ SỬA CSS INLINE ĐỂ DỊCH CHUYỂN) */}
            <main 
                className="container-fluid py-4 px-lg-5"
                style={{
                    paddingTop: HEADER_HEIGHT, // Đảm bảo nội dung không bị Header che
                    marginLeft: showSidebar ? SIDEBAR_WIDTH : '0', // Dịch chuyển nội dung chính
                    width: showSidebar ? `calc(100% - ${SIDEBAR_WIDTH})` : '100%', // Thu hẹp chiều rộng
                    transition: 'all 0.3s' // Hiệu ứng mượt mà
                }}
            >
                
                {/* Tiêu đề trang và nút Thêm */}
                <div className="d-flex justify-content-between align-items-center mb-4" style={{ marginTop: '60px' }}>
                    <div>
                        <h2 className="fw-bold">Grammar Elementary</h2>
                        <p className="text-muted">Quản lý và chỉnh sửa nội dung bài học</p>
                    </div>
                    <button className="btn btn_add btn-primary-green d-flex align-items-center px-4 py-2">
                        <FaPlus className="me-2 " />
                        Thêm bài học mới
                    </button>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="input-group" style={{ maxWidth: '350px' }}>
                        <span className="input-group-text bg-white border-end-0"><FaSearch /></span>
                        <input 
                            type="text" 
                            className="form-control border-start-0" 
                            placeholder="Tìm kiếm bài học..." 
                        />
                    </div>
                    
                    <div className="d-flex">
                        <div className="dropdown me-3">
                            <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Tất cả trạng thái
                            </button>
                            {/* ... Dropdown items ... */}
                        </div>
                        <button className="btn btn-outline-secondary"><FaFilter /></button>
                    </div>
                </div>

                {/* Bảng Danh sách Bài học */}
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                {/* ... Thead và Tbody ... */}
                                <thead className="bg-light">
                                    <tr>
                                        <th scope="col" style={{ width: '20%' }}>Tiêu đề</th>
                                        <th scope="col" style={{ width: '35%' }}>Mô tả</th>
                                        <th scope="col" style={{ width: '10%' }}>Trạng thái</th>
                                        <th scope="col" style={{ width: '10%' }}>Lượt xem</th>
                                        <th scope="col" style={{ width: '10%' }}>Cập nhật</th>
                                        <th scope="col" style={{ width: '15%' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lessonData.map((lesson, index) => (
                                        <tr key={index}>
                                            <td>{lesson.title}</td>
                                            <td >{lesson.description}</td>
                                            <td ><StatusBadge  status={lesson.status} /></td>
                                            <td  className="text-muted d-flex align-items-center">
                                                <FaEye  className="me-1" /> {lesson.views}
                                            </td>
                                            <td className="text-muted">{lesson.updated}</td>
                                            <td className="table-actions">
                                                <button className="btn btn-sm btn-outline-primary"><FaPencilAlt /></button>
                                                <button style = {{marginLeft:'10px'}} className="btn btn-sm btn-outline-danger"><FaTrashAlt /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                
            </main>
        </>
    );
}