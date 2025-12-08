'use client';
import React, { useState } from 'react';
import {
    FaTachometerAlt, FaBook, FaLanguage, FaHeadphones,
    FaFileAlt, FaPenNib, FaUsers, FaCog, FaAngleDown, FaAngleUp
} from 'react-icons/fa';

// Định nghĩa props cơ bản cho việc ẩn/hiện
interface SidebarProps {
    show?: boolean; // Sử dụng để điều khiển ẩn/hiện
}

const sidebarItems = [
    { name: 'Tổng quan', icon: FaTachometerAlt, link: '/page/Admin/Content/Overview' },
    {
        name: 'Ngữ pháp', icon: FaBook, link: '#', children: [
            { name: 'Ngữ pháp A1', link: '/page/Admin/Content/Grammar/A1' },
            { name: 'Ngữ pháp A2', link: '/page/Admin/Content/Grammar/A2' },
            { name: 'Ngữ pháp B1', link: '/page/Admin/Content/ngu-phap-b1' },
        ]
    },
    {
        name: 'Từ vựng', icon: FaLanguage, link: '#', children: [
            { name: 'Từ vựng A1', link: '/page/Admin/Content/tu-vung-a1' },
            { name: 'Từ vựng A2', link: '/page/Admin/Content/tu-vung-a2' },
            { name: 'Từ vựng B1', link: '/page/Admin/Content/tu-vung-b1' },
        ]
    },
    {
        name: 'Nghe', icon: FaHeadphones, link: '#', children: [
            { name: 'Nghe A1', link: '/page/Admin/Content/nghe-a1' },
            { name: 'Nghe A2', link: '/page/Admin/Content/nghe-a2' },
            { name: 'Nghe B1', link: '/page/Admin/Content/nghe-b1' },
        ]
    },
    {
        name: 'Đọc', icon: FaFileAlt, link: '#', children: [
            { name: 'Đọc A1', link: '/page/Admin/Content/doc-a1' },
            { name: 'Đọc A2', link: '/page/Admin/Content/doc-a2' },
            { name: 'Đọc B1', link: '/page/Admin/Content/doc-b1' },
        ]
    },
    {
        name: 'Viết', icon: FaPenNib, link: '#', children: [
            { name: 'Viết A1', link: '/page/Admin/Content/viet-a1' },
            { name: 'Viết A2', link: '/page/Admin/Content/viet-a2' },
            { name: 'Viết B1', link: '/page/Admin/Content/viet-b1' },
        ]
    },
    { name: 'Người dùng', icon: FaUsers, link: '/page/Admin/users' },
    { name: 'Cài đặt', icon: FaCog, link: '/page/Admin/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ show = true }) => {
    const [openDropdown, setOpenDropdown] = useState('');

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? '' : name);
    };

    // Lược bỏ hàm getSlugFromLink và logic onSelect/onClose vì không cần thiết cho mục đích hiển thị
    
    return (
        // Áp dụng CSS cố định (position: fixed) và transform để điều khiển ẩn/hiện
        <div 
            className="bg-dark text-white p-3" 
            style={{ 
                width: '240px', 
                height: '100vh',
                position: 'fixed', // Quan trọng: Đặt Sidebar cố định
                top: 0,
                left: 0,
                zIndex: 1020, // Để nằm dưới Header (thường là 1030)
                transition: 'transform 0.3s ease-in-out',
                transform: show ? 'translateX(0)' : 'translateX(-100%)', // Logic ẩn/hiện
            }}
        >
            <h3 className="text-success mb-4 text-center">Bảng quản trị</h3>
            
            <ul className="nav nav-pills flex-column mb-auto">
                {sidebarItems.map((item) => (
                    <li key={item.name} className="nav-item mb-4">
                        {item.children ? (
                            <>
                                <a
                                    className={`nav-link text-white d-flex align-items-center ${openDropdown === item.name ? 'active bg-secondary' : ''}`}
                                    onClick={() => toggleDropdown(item.name)}
                                    role="button"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <item.icon className="me-2" />
                                    {item.name}
                                    <span className="ms-auto">{openDropdown === item.name ? <FaAngleUp /> : <FaAngleDown />}</span>
                                </a>
                                <div className={`collapse ${openDropdown === item.name ? 'show' : ''}`}>
                                    <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small ps-4">
                                        {item.children.map((child) => (
                                            <li key={child.name} className="mb-2">
                                                <a
                                                    className="link-light rounded text-decoration-none py-2 d-block"
                                                    href={child.link} // Dùng href thay vì onClick
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {child.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <a
                                className="nav-link text-white"
                                href={item.link} // Dùng href thay vì onClick
                                style={{ cursor: 'pointer' }}
                            >
                                <item.icon className="me-2" />
                                {item.name}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;