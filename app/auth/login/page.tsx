"use client";

import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";
import { useApi } from "@/app/hooks/useApi";
import { useToast } from "@/app/hooks/useToast";
import authApi from "@/app/services/api/authAPI";
import { Modal } from "antd";
import "./login.css";

const loginImageUrl = "/img/Login_img.png";

export default function Login() {
  const router = useRouter();
  const { showToast } = useToast();
  const { callApi } = useApi(showToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [isDialog, setIsDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Nếu đã login → chuyển về home
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.push("/");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Vui lòng nhập Email.");
    if (!password) return setError("Vui lòng nhập mật khẩu.");

    try {
      const data = await callApi(
        () => authApi.login({ email, password }),
        true,
        true
      );

      if (!data.activate) {
        showToast(
          "error",
          "Lỗi",
          "Tài khoản chưa được kích hoạt. Vui lòng nhập OTP!"
        );
        setIsDialog(true);
        const expire = Date.now() + 30000;
        localStorage.setItem("otpExpire", expire.toString());
        setTimeLeft(30);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      showToast(
        "error",
        "Đăng nhập thất bại",
        err?.response?.data?.message || "Email hoặc mật khẩu không đúng"
      );
    }
  };

  const handleOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError(false);
      return;
    }
    setOtpError(false);

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
    }
  };

  const resendOtp = async () => {
    if (timeLeft > 0) return;
    try {
      await authApi.resend_otp({ email });
      setTimeLeft(30);
      localStorage.setItem("otpExpire", (Date.now() + 30000).toString());
      showToast("success", "Thành công", "Gửi lại OTP thành công!");
    } catch (err: any) {
      //
    }
  };
  useEffect(() => {
    if (timeLeft <= 0) return; // dừng khi hết thời gian

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) localStorage.removeItem("otpExpire");
        return next;
      });
    }, 1000);

    return () => clearInterval(timer); // cleanup
  }, [timeLeft]);

  return (
    <>
      <MainHeader />
      <div className="login-container vh-100 p-0">
        <div className="row h-100 g-0">
          <div className="col-lg-7 d-none d-lg-flex justify-content-center align-items-center login-image-col">
            <img src={loginImageUrl} alt="Sneaker" className="login-image" />
          </div>

          <div className="col-lg-5 d-flex justify-content-center align-items-center bg-white">
            <div className="login-form-container">
              <h2 className="login-title">Đăng nhập</h2>
              <p className="login-subtitle mb-4">Điền thông tin chi tiết</p>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="form-control-custom mb-4"
                  placeholder="Email hoặc số điện thoại"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control-custom mb-4"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div
                  className="d-flex justify-content-between mt-4"
                  style={{ position: "relative" }}
                >
                  <button
                    type="submit"
                    className="btn btn-danger btn-login w-auto"
                  >
                    Đăng nhập
                  </button>
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "-130%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  <Link
                    href="/auth/ForgotPassword"
                    className="forgot-password-link"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </form>

              <p className="d-flex justify-content-around signup-link mt-4">
                Chưa có tài khoản?
                <Link href="/auth/register" className="fw-bold text-dark ms-1">
                  Đăng ký
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <MainFooter />

      <Modal
        open={isDialog}
        centered
        onCancel={() => setIsDialog(false)}
        footer={null}
        width={380}
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
          >
            {timeLeft > 0 ? `Gửi lại (${timeLeft}s)` : "Gửi lại OTP"}
          </button>
        </div>
      </Modal>
    </>
  );
}
