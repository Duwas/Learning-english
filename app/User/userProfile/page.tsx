"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/app/hooks/useApi";
import { useToast } from '@/app/hooks/useToast';
import { handleApiError } from '@/app/services/handleAPIErr';
import MainFooter from '@/app/components/layout/Footer';
import MainHeader from '@/app/components/layout/Header';
import authApi from '@/app/services/api/authAPI';
import Head from "next/head";
import {
  FaUser,
  FaChartLine,
  FaAward,
  FaCog,
  FaRegEnvelope,
  FaPhoneAlt,
  FaRegCalendarAlt,
  FaEdit,
  FaShareAlt,
} from "react-icons/fa";
import authService from "@/app/services/authServices";

const UserProfile = () => {
  const { showToast } = useToast();
  const { callApi } = useApi(showToast);

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin từ BE
  const fetchUser = async () => {
    try {
      const data = await callApi(() => authService.getProfile());

      setUserData({
        name: data.name,
        title: data.role || "Học viên",
        email: data.email,
        phone: data.phone ?? "Chưa cập nhật",
        memberSince: data.createdAt?.slice(0, 10),
        lessonsCompleted: data.lessonsCompleted ?? 0,
        accumulatedPoints: data.points ?? 0,
        consecutiveDays: data.consecutiveDays ?? 0,
        achievements: data.achievements ?? 0,
        birthdate: data.birthdate ?? "Chưa cập nhật",
        gender: data.gender ?? "Chưa cập nhật",
        address: data.address ?? "Chưa cập nhật",
        avatar: data.avatar ?? "/path-to-your-avatar.jpg",
      });
    } catch (err) {
      showToast("error", "Lỗi", "Không thể tải dữ liệu người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading || !userData) return <div>Đang tải...</div>;

  return (
    <>
      <MainHeader />

      <Head>
        <title>{userData.name} - Hồ sơ</title>
      </Head>

      <div className="user-profile-dashboard">
        {/* Header Profile */}
        <div className="profile-header bg-white rounded shadow-sm p-4 mb-4">
          <div className="d-flex align-items-center mb-3">
            <div className="profile-picture-container me-3">
              <img
                src={userData.avatar}
                alt="Avatar"
                className="profile-picture rounded-circle"
              />
              <span className="camera-icon">
                <FaEdit />
              </span>
            </div>

            <div>
              <h3 className="mb-0 profile-name">{userData.name}</h3>
              <p className="text-muted profile-title">{userData.title}</p>

              <div className="profile-contact-info d-flex flex-wrap align-items-center mt-2">
                <span className="me-3">
                  <FaRegEnvelope /> {userData.email}
                </span>
                <span className="me-3">
                  <FaPhoneAlt /> {userData.phone}
                </span>
                <span className="me-3">
                  <FaRegCalendarAlt /> Tham gia: {userData.memberSince}
                </span>
              </div>
            </div>

            <div className="ms-auto profile-actions">
              <button className="btn btn-success me-2">
                <FaEdit className="me-1" /> Chỉnh sửa hồ sơ
              </button>
              <button className="btn btn-secondary-outline">
                <FaShareAlt className="me-1" /> Chia sẻ
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="row statistics-row">
            <div className="col-lg-3 col-sm-6 mb-2">
              <div className="stat-card p-3 rounded text-center">
                <div className="stat-number">{userData.lessonsCompleted}</div>
                <div className="stat-label">Bài học hoàn thành</div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6 mb-2">
              <div className="stat-card p-3 rounded text-center">
                <div className="stat-number">{userData.accumulatedPoints}</div>
                <div className="stat-label">Điểm tích lũy</div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6 mb-2">
              <div className="stat-card p-3 rounded text-center">
                <div className="stat-number">{userData.consecutiveDays}</div>
                <div className="stat-label">Ngày liên tiếp</div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6 mb-2">
              <div className="stat-card p-3 rounded text-center">
                <div className="stat-number">{userData.achievements}</div>
                <div className="stat-label">Thành tích</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card tab-navigation-card mb-4 border-0 shadow-sm">
          <div className="card-body p-0">
            <ul className="nav nav-tabs profile-tabs">
              <li className="nav-item">
                <a className="nav-link active" data-bs-toggle="tab" href="#personal-info">
                  <FaUser className="me-2" /> Thông tin cá nhân
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#progress">
                  <FaChartLine className="me-2" /> Tiến độ học tập
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#achievements">
                  <FaAward className="me-2" /> Thành tích
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#settings">
                  <FaCog className="me-2" /> Cài đặt
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Personal Info */}
        <div className="tab-content">
          <div className="tab-pane fade show active" id="personal-info">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title">Thông tin cá nhân</h4>
                  <button className="btn btn-success">
                    <FaEdit className="me-1" /> Chỉnh sửa
                  </button>
                </div>

                <div className="row personal-info-detail">
                  <div className="col-md-6">
                    <div className="info-group mb-3">
                      <div className="info-label">Họ và tên</div>
                      <div className="info-value">{userData.name}</div>
                    </div>

                    <div className="info-group mb-3">
                      <div className="info-label">Số điện thoại</div>
                      <div className="info-value">{userData.phone}</div>
                    </div>

                    <div className="info-group mb-3">
                      <div className="info-label">Giới tính</div>
                      <div className="info-value">{userData.gender}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="info-group mb-3">
                      <div className="info-label">Email</div>
                      <div className="info-value">{userData.email}</div>
                    </div>

                    <div className="info-group mb-3">
                      <div className="info-label">Ngày sinh</div>
                      <div className="info-value">{userData.birthdate}</div>
                    </div>

                    <div className="info-group mb-3">
                      <div className="info-label">Địa chỉ</div>
                      <div className="info-value">{userData.address}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      <MainFooter />
    </>
  );
};

export default UserProfile;
