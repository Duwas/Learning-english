"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Avatar,
  Input,
  Button,
  Spin,
  message,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FaSearch, FaLock, FaLockOpen, FaTrash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "@/app/components/sidebar/page";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import dashboardAPI from "@/app/services/api/dashboard";

interface UserFromAPI {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  address: string;
  avatarUrl: string;
  role: string;
  status: number;
  createdAt: string;
}

interface DataType {
  key: string;
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  status: number;
  joinDate: string;
}

const SIDEBAR_WIDTH = 240;

export default function UserManagement() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getAllUsers();

        if (response.data && Array.isArray(response.data)) {
          const mappedData: DataType[] = response.data.map(
            (user: UserFromAPI) => ({
              key: user.id.toString(),
              id: user.id,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl,
              status: user.status,
              joinDate: user.createdAt
                ? new Date(user.createdAt).toISOString().split("T")[0]
                : "N/A",
            })
          );
          setData(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        message.error("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    return {
      total: data.length,
      active: data.filter((u) => u.status === 1).length,
      locked: data.filter((u) => u.status === 2).length,
      pending: data.filter((u) => u.status === 0).length,
    };
  }, [data]);

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleStatusChange = async (record: DataType) => {
    try {
      const newStatus = record.status === 2 ? 1 : 2;
      const actionText = newStatus === 2 ? "khóa" : "mở khóa";

      await dashboardAPI.updateStatusAccount(record.id);

      message.success(`Đã ${actionText} tài khoản ${record.name}`);

      setData((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dashboardAPI.deleteAccount(id);
      message.success("Xóa tài khoản thành công!");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi xóa tài khoản.");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names.length > 1
      ? names[names.length - 2][0] + names[names.length - 1][0]
      : name[0];
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      align: "center",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-2">
          {record.avatarUrl ? (
            <Avatar src={record.avatarUrl} />
          ) : (
            <Avatar style={{ backgroundColor: "#fde3cf", color: "#f56a00" }}>
              {getInitials(text)}
            </Avatar>
          )}
          <span className="fw-bold text-dark">{text}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "text-secondary",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "Không xác định";

        if (status === 1) {
          color = "success";
          text = "Hoạt động";
        } else if (status === 2) {
          color = "error";
          text = "Đã khóa";
        } else if (status === 0) {
          color = "warning";
          text = "Chưa kích hoạt";
        }

        return (
          <Tag color={color} style={{ borderRadius: "10px", fontWeight: 500 }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tham gia",
      dataIndex: "joinDate",
      key: "joinDate",
      className: "text-secondary",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        const isLocked = record.status === 2;
        return (
          <div className="d-flex gap-2 align-items-center">
            {/* SỬA ĐỔI QUAN TRỌNG: Dùng Button thay cho div để bấm nhạy hơn */}
            <Tooltip title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}>
              <Button
                type="text"
                shape="circle"
                icon={
                  isLocked ? <FaLock size={16} /> : <FaLockOpen size={16} />
                }
                style={{
                  color: isLocked ? "#52c41a" : "#faad14",
                  backgroundColor: "transparent",
                }}
                onClick={() => handleStatusChange(record)}
              />
            </Tooltip>

            {/* Nút Xóa */}
            <Popconfirm
              title="Xóa người dùng"
              description="Hành động này không thể hoàn tác!"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa vĩnh viễn">
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={<FaTrash size={16} />}
                  style={{ backgroundColor: "transparent" }}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Sidebar show={showSidebar} />

      <div
        style={{
          marginLeft: showSidebar ? SIDEBAR_WIDTH : 0,
          width: "100%",
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={showSidebar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setShowSidebar(!showSidebar)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
          <h5 className="fw-bold m-0 ms-2">Hệ thống quản trị</h5>
        </div>

        <div className="container-fluid p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark m-0">Quản lý Users</h2>
          </div>

          {/* Cards Thống kê */}
          <div className="row mb-4 g-3">
            {[
              {
                title: "Tổng Users",
                value: stats.total,
                color: "#1890ff",
                bg: "#e6f7ff",
              },
              {
                title: "Active",
                value: stats.active,
                color: "#52c41a",
                bg: "#f6ffed",
              },
              {
                title: "Locked",
                value: stats.locked,
                color: "#ff4d4f",
                bg: "#fff1f0",
              },
              {
                title: "Chưa kích hoạt",
                value: stats.pending,
                color: "#faad14",
                bg: "#fffbe6",
              },
            ].map((stat, index) => (
              <div key={index} className="col-md-3 col-sm-6">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ borderLeft: `5px solid ${stat.color}` }}
                >
                  <div className="card-body p-4">
                    <h2 className="fw-bold m-0" style={{ color: stat.color }}>
                      {loading ? <Spin size="small" /> : stat.value}
                    </h2>
                    <p className="text-secondary mb-0 fw-bold">{stat.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bảng dữ liệu */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row mb-4 align-items-center">
                <div className="col-md-4">
                  <Input
                    size="large"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    prefix={<FaSearch className="text-secondary" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </div>
                <div className="col-md-8 text-md-end mt-2 mt-md-0">
                  <span className="badge bg-light text-dark border p-2">
                    Hiển thị: {filteredData.length} / {data.length} users
                  </span>
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 5, showSizeChanger: true }}
                loading={loading}
                rowClassName="align-middle"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
