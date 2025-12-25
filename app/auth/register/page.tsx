"use client";
import React, { useState, useEffect, useContext, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./register.css";
import MainFooter from "@/app/components/layout/Footer";
import MainHeader from "@/app/components/layout/Header";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useToast } from "@/app/hooks/useToast";
import { handleApiError } from "@/app/services/handleAPIErr";
import { isValidEmail, isValidPassword } from "@/app/services/ultis/validator";
import { LoadingContext } from "@/app/context/LoadingContext";
import { Modal } from "antd";
import authApi from "@/app/services/api/authAPI";
import { useApi } from "@/app/hooks/useApi";
const registerImageUrl = "/img/Register_img.png";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function Register() {
  const router = useRouter();
  const { showToast } = useToast();
  const { loading, setLoading } = useContext(LoadingContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [isDialog, setIsDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const { callApi } = useApi(showToast);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading();
    localStorage.removeItem("otpExpire");

    if (!name.trim())
      return showToast("error", "Lỗi", "Vui lòng nhập họ và tên");
    if (!phone.trim())
      return showToast("error", "Lỗi", "Vui lòng nhập số điện thoại");
    if (!email.trim() || !isValidEmail(email))
      return showToast("error", "Lỗi", "Vui lòng nhập email hợp lệ");
    if (!isValidPassword(password))
      return showToast("error", "Lỗi", "Mật khẩu phải từ 8 ký tự trở lên");
    if (password !== confirmPassword)
      return showToast("error", "Lỗi", "Mật khẩu nhập lại không khớp");

    try {
      await callApi(
        () => authApi.register({ name, phone, email, password }),
        true,
        true
      );
      showToast(
        "success",
        "Thành công",
        "Đăng ký thành công! Vui lòng nhập OTP để kích hoạt."
      );
      setIsDialog(true);
      setTimeLeft(30);
      localStorage.setItem("otpExpire", (Date.now() + 30000).toString());
    } catch (err: any) {
      handleApiError(err, showToast);
    } finally {
      setLoading();
    }
  };
  const handleOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError(false);
      return;
    }
    setOtpError(false);
    setLoading();

    try {
      console.log(email, otp);
      await callApi(() => authApi.verify_otp(email, otp), true, true);
      showToast("success", "Thành công", "Xác thực tài khoản thành công!");
      setOtp("");
      setIsDialog(false);
      router.push("/auth/login");
    } catch (err: any) {
      showToast(
        "error",
        "OTP sai",
        err?.response?.data?.message || "Mã OTP không chính xác!"
      );
    } finally {
      setLoading();
    }
  };

  const resendOtp = async () => {
    setLoading();
    if (timeLeft > 0) return;
    try {
      await authApi.resend_otp(email);
      setTimeLeft(30);
      localStorage.setItem("otpExpire", (Date.now() + 30000).toString());
      showToast("success", "Thành công", "Gửi lại OTP thành công!");
    } catch (err: any) {
      handleApiError(err, showToast);
    } finally {
      setLoading();
    }
  };
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) localStorage.removeItem("otpExpire");
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);
  return (
    <>
      <div>
        <MainHeader />
        <div className="register-container vh-100 p-0">
          <div className="row h-100 g-0">
            <div className="col-lg-7 d-none d-lg-flex justify-content-center align-items-center register-image-col">
              <img
                src={registerImageUrl}
                alt="Register"
                className="register-image"
              />
            </div>

            <div className="col-lg-5 d-flex justify-content-center align-items-center bg-white">
              <div className="register-form-container">
                <h2 className="register-title">Tạo tài khoản mới</h2>
                <p className="register-subtitle mb-4">
                  Điền thông tin chi tiết
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <input
                      type="text"
                      className="form-control-custom"
                      placeholder="Họ và tên"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <input
                      type="text"
                      className="form-control-custom"
                      placeholder="Số điện thoại"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <input
                      type="email"
                      className="form-control-custom"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      name="email_register"
                    />
                  </div>

                  <div className="form-group mb-3 position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control-custom"
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      name="password_register"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control-custom"
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger btn-register w-100 mb-3"
                  >
                    Tạo tài khoản mới
                  </button>
                </form>

                <p className="text-center login-link">
                  Đã có tài khoản?{" "}
                  <Link href="/auth/login" className="fw-bold text-dark ms-1">
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <MainFooter />
      </div>

      <Modal
        open={isDialog}
        centered
        onCancel={() => setIsDialog(false)}
        footer={null}
        width={380}
        destroyOnClose
      >
        <div className="text-center">
          <h2 className="otp-title">Nhập mã OTP</h2>

          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className={`otp-input ${otpError ? "otp-error" : ""}`}
            placeholder="Nhập 6 chữ số"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="OTP"
          />

          {otpError && (
            <div className="otp-error-text">OTP phải gồm 6 chữ số</div>
          )}

          <button
            onClick={handleOTP}
            className="otp-btn-confirm"
            style={{ marginTop: 18 }}
          >
            Xác nhận
          </button>
          <button
            onClick={resendOtp}
            className="otp-btn-resend"
            disabled={timeLeft > 0}
            style={{ marginTop: 10 }}
            aria-disabled={timeLeft > 0}
          >
            {timeLeft > 0 ? `Gửi lại (${timeLeft}s)` : "Gửi lại OTP"}
          </button>
        </div>
      </Modal>
    </>
  );
}
