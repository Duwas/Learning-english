"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CameraOutlined,
  EditOutlined,
  ShareAltOutlined,
  LoadingOutlined,
  LogoutOutlined,
  LockOutlined,
  ExclamationCircleOutlined, // Import icon cảnh báo cho popup logout
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import dayjs from "dayjs";

// Import API
import infoApi from "@/app/services/api/infoAPI";
import authApi from "@/app/services/api/authAPI";
import MainFooter from "@/app/components/layout/Footer";
import MainHeader from "@/app/components/layout/Header";

// --- STYLES ---
const styles = {
  headerBg: {
    backgroundColor: "#343a40",
    color: "#fff",
    paddingTop: "40px",
    paddingBottom: "20px",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
  },
  greenBtn: {
    backgroundColor: "#76ce2b",
    borderColor: "#76ce2b",
    color: "#fff",
    fontWeight: "600" as const,
  },
  grayBtn: {
    backgroundColor: "#6c757d",
    borderColor: "#6c757d",
    color: "#fff",
  },
  orangeBtn: {
    backgroundColor: "#ffc107",
    borderColor: "#ffc107",
    color: "#000",
    fontWeight: "600" as const,
    marginLeft: "10px",
  },
  logoutBtn: {
    marginLeft: "10px",
  },
  tabButton: {
    border: "none",
    background: "transparent",
    padding: "10px 20px",
    fontWeight: "600" as const,
    color: "#555",
    borderRadius: "6px",
    marginRight: "10px",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  activeTab: {
    backgroundColor: "#76ce2b",
    color: "#fff",
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    padding: "20px",
    marginTop: "20px",
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold" as const,
    marginBottom: "20px",
    color: "#333",
  },
  infoLabel: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "5px",
  },
  infoValue: {
    color: "#333",
    fontWeight: "500" as const,
    fontSize: "16px",
  },
};

const formatDate = (isoString: string) => {
  if (!isoString) return "N/A";
  try {
    const date = dayjs(isoString);
    if (!date.isValid()) return "N/A";
    return date.format("DD/MM/YYYY");
  } catch (e) {
    return isoString;
  }
};

export default function UserProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [openLogout, setOpenLogout] = useState(false);

  // State Data
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Forms
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const storedUserStr = localStorage.getItem("user");

      if (!storedUserStr) {
        message.warning("Vui lòng đăng nhập.");
        router.push("/login"); // Hoặc /auth/login tùy route của bạn
        return;
      }

      const currentUser = JSON.parse(storedUserStr);
      const userId = currentUser.id || currentUser.userId;

      const [profileRes, authRes] = await Promise.all([
        infoApi.getProfile(userId),
        authApi.getAll(),
      ]);

      const profileData = profileRes?.data;
      const authList = authRes?.data;
      const authUser = Array.isArray(authList)
        ? authList.find((u: any) => u.id === profileData.id)
        : null;

      const finalProfile = {
        ...profileData,
        birthday: profileData.birthday || profileData.dob,
        createdAt: authUser ? authUser.createdAt : new Date().toISOString(),
      };

      setProfile(finalProfile);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleLogoutProcess = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/auth/login"; // Chuyển về trang đăng nhập
  };
  const handleLogout = () => {
    setOpenLogout(true);
  };

  // --- LOGIC 2: UPLOAD AVATAR ---
  const handleAvatarUpload: UploadProps["customRequest"] = async ({
    file,
    onSuccess,
    onError,
  }) => {
    try {
      setIsUploadingAvatar(true);
      await infoApi.updateAvatar(profile.id, file as File);
      message.success("Cập nhật avatar thành công");
      onSuccess?.("ok");
      await fetchData();
    } catch (err) {
      console.error(err);
      message.error("Upload avatar thất bại");
      onError?.(err as Error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const uploadProps: UploadProps = {
    showUploadList: false,
    customRequest: handleAvatarUpload,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) message.error("Chỉ được tải lên file ảnh!");
      return isImage;
    },
  };

  // --- LOGIC 3: UPDATE INFO ---
  const showEditModal = () => {
    if (!profile) return;
    form.setFieldsValue({
      name: profile.name,
      phone: profile.phone,
      gender: profile.gender,
      address: profile.address,
      birthday: profile.birthday ? dayjs(profile.birthday) : null,
    });
    setIsModalOpen(true);
  };

  const handleUpdateInfo = async (values: any) => {
    try {
      setIsUpdatingInfo(true);
      const birthdayString = values.birthday
        ? values.birthday.format("YYYY-MM-DD")
        : "2000-01-01";

      const textData = {
        name: values.name,
        phone: values.phone,
        gender: values.gender,
        address: values.address,
        birthday: birthdayString,
      };

      await infoApi.updateInfo(profile.id, textData);
      message.success("Cập nhật thông tin thành công!");
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error("Update Info Error:", error);
      message.error("Cập nhật thất bại.");
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  // --- LOGIC 4: CHANGE PASSWORD (Có Popup xác nhận) ---
  const showChangePassModal = () => {
    passForm.resetFields();
    setIsPassModalOpen(true);
  };

  const handleChangePassword = async (values: any) => {
    try {
      setIsChangingPass(true);
      const { oldPassword, newPassword } = values;

      // 1. Gọi API đổi mật khẩu
      await infoApi.changePassword(profile.id, oldPassword, newPassword);

      // 2. Đóng modal form nhập liệu
      setIsPassModalOpen(false);

      Modal.success({
        title: "Đổi mật khẩu thành công!",
        content:
          "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại để tiếp tục.",
        okText: "Đăng nhập lại",
        onOk: () => {
          handleLogoutProcess();
        },
      });
    } catch (error: any) {
      console.error("Change Password Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Đổi mật khẩu thất bại. Mật khẩu cũ không đúng?";
      message.error(errorMsg);
    } finally {
      setIsChangingPass(false);
    }
  };

  // --- RENDER UI ---
  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#76ce2b" }} spin />
          }
        />
      </div>
    );

  if (!profile) return null;

  return (
    <>
      <MainHeader />
      <div
        style={{
          marginTop: "3%",
          backgroundColor: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        {/* Header Profile */}
        <div style={styles.headerBg}>
          <div className="container">
            <div className="row align-items-center mb-4">
              <div className="col-md-8 d-flex align-items-center">
                {/* Avatar */}
                <div style={{ position: "relative", marginRight: "20px" }}>
                  {isUploadingAvatar ? (
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: "#ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "3px solid #fff",
                      }}
                    >
                      <Spin />
                    </div>
                  ) : (
                    <Avatar
                      size={100}
                      src={profile.avatarUrl}
                      icon={<UserOutlined />}
                      style={{ border: "3px solid #fff" }}
                    />
                  )}
                  <Upload {...uploadProps}>
                    <button
                      style={{
                        position: "absolute",
                        bottom: "5px",
                        right: "0",
                        background: "#76ce2b",
                        border: "2px solid #fff",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "white",
                      }}
                    >
                      <CameraOutlined />
                    </button>
                  </Upload>
                </div>

                {/* Name & Basic Info */}
                <div>
                  <h2
                    style={{
                      color: "#fff",
                      marginBottom: "5px",
                      fontSize: "24px",
                    }}
                  >
                    {profile.name}
                  </h2>
                  <span
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      opacity: 0.8,
                    }}
                  >
                    {profile.role === "USER" ? "Học viên" : profile.role}
                  </span>
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>
                    <span className="me-3">
                      <MailOutlined /> {profile.email}
                    </span>
                    <span className="me-3">
                      <PhoneOutlined /> {profile.phone || "---"}
                    </span>
                    <span>
                      <CalendarOutlined /> Tham gia:{" "}
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <Button
                  danger
                  size="large"
                  icon={<LogoutOutlined />}
                  style={styles.logoutBtn}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
                <Modal
                  open={openLogout}
                  title="Xác nhận đăng xuất"
                  okText="Đăng xuất"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onOk={() => {
                    handleLogoutProcess();
                    message.success("Đã đăng xuất thành công!");
                    setOpenLogout(false);
                  }}
                  onCancel={() => setOpenLogout(false)}
                >
                  Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
                </Modal>
              </div>
            </div>
          </div>
        </div>

        {/* Info Body */}
        <div className="container mt-4">
          <div
            style={{
              background: "#fff",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === "info" ? styles.activeTab : {}),
              }}
            >
              <UserOutlined className="me-2" /> Thông tin cá nhân
            </button>
          </div>

          <div style={styles.contentCard}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
              <h4 style={styles.sectionTitle} className="m-0">
                Thông tin cá nhân
              </h4>
              <div>
                <Button
                  style={styles.greenBtn}
                  icon={<EditOutlined />}
                  onClick={showEditModal}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  style={styles.orangeBtn}
                  icon={<LockOutlined />}
                  onClick={showChangePassModal}
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <div style={styles.infoLabel}>Full Name</div>
                <div style={styles.infoValue}>{profile.name}</div>
              </div>
              <div className="col-md-6">
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}>{profile.email}</div>
              </div>
              <div className="col-md-6">
                <div style={styles.infoLabel}>Phone Number</div>
                <div style={styles.infoValue}>{profile.phone || "---"}</div>
              </div>
              <div className="col-md-6">
                <div style={styles.infoLabel}>Birthday</div>
                <div style={styles.infoValue}>
                  {formatDate(profile.birthday)}
                </div>
              </div>
              <div className="col-md-6">
                <div style={styles.infoLabel}>Gender</div>
                <div style={styles.infoValue}>{profile.gender || "---"}</div>
              </div>
              <div className="col-md-6">
                <div style={styles.infoLabel}>Address</div>
                <div style={styles.infoValue}>{profile.address || "---"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MainFooter />

      <Modal
        title="Chỉnh sửa thông tin"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateInfo}>
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: "Nhập tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Nhập SĐT" }]}
          >
            <Input />
          </Form.Item>
          <div className="row">
            <div className="col-6">
              <Form.Item label="Ngày sinh" name="birthday">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </div>
            <div className="col-6">
              <Form.Item label="Giới tính" name="gender">
                <Select>
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <Form.Item label="Địa chỉ" name="address">
            <Input.TextArea rows={2} />
          </Form.Item>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isUpdatingInfo}
              style={{ backgroundColor: "#76ce2b", borderColor: "#76ce2b" }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Đổi mật khẩu"
        open={isPassModalOpen}
        onCancel={() => setIsPassModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={passForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            label="Mật khẩu hiện tại"
            name="oldPassword"
            rules={[{ required: true, message: "Nhập mật khẩu cũ" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu cũ" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Nhập mật khẩu mới" },
              { min: 6, message: "Tối thiểu 6 ký tự" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button onClick={() => setIsPassModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isChangingPass}
              style={{
                backgroundColor: "#ffc107",
                borderColor: "#ffc107",
                color: "#000",
              }}
            >
              Cập nhật mật khẩu
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
