"use client";
import React, { useState, useEffect, FormEvent, useContext } from "react";
import { useRouter } from "next/navigation";
import authApi from "@/app/services/api/authAPI";
import { isValidEmail } from "@/app/services/ultis/validator";
import { useApi } from "@/app/hooks/useApi";
import { useToast } from "@/app/hooks/useToast";
import { LoadingContext } from "@/app/context/LoadingContext";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";
import "./ForgotPassword.css";
import { handleApiError } from "@/app/services/handleAPIErr";

export default function ForgotPassword() {
  const router = useRouter();
  const { showToast } = useToast();
  const { loading, setLoading } = useContext(LoadingContext);
  const { callApi } = useApi(showToast);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [isDialog, setIsDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // ================= Submit email =================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !isValidEmail(email))
      return showToast("error", "Lỗi", "Vui lòng nhập email hợp lệ");

    setLoading();
    localStorage.removeItem("otpExpire");

    try {
      await callApi(() => authApi.forgot_password({ email }), true, true);
      showToast(
        "success",
        "Thành công",
        "OTP đã gửi. Vui lòng kiểm tra email."
      );

      setIsDialog(true);
      setTimeLeft(30);
      localStorage.setItem("otpExpire", (Date.now() + 30000).toString());
    } catch (err: any) {
      showToast(
        "error",
        "Lỗi",
        err?.response?.data?.message || "Không thể gửi OTP"
      );
    } finally {
      setLoading();
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(
      () => setTimeLeft((prev) => Math.max(prev - 1, 0)),
      1000
    );
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError(true);
      return;
    }

    setOtpError(false);
    setLoading();

    try {
      await callApi(() => authApi.verify_otp({ email, otp }), true, true);
      showToast("success", "Thành công", "Xác nhận OTP thành công!");
      localStorage.removeItem("otpExpire");
      router.push(`/auth/ResetPass?email=${encodeURIComponent(email)}`);
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
    if (timeLeft > 0) return;
    setLoading();
    try {
      await authApi.resend_otp({ email });
      setTimeLeft(30);
      localStorage.setItem("otpExpire", (Date.now() + 30000).toString());
      showToast("success", "Thành công", "Đã gửi lại OTP!");
    } catch (err: any) {
      showToast(
        "error",
        "Lỗi",
        err?.response?.data?.message || "Không thể gửi lại OTP"
      );
    } finally {
      setLoading();
    }
  };

  return (
    <>
      <MainHeader />
      <div className="forgot-password-container container-fluid vh-100 p-0">
        <div className="row h-100 g-0">
          <div className="col-lg-7 d-none d-lg-flex justify-content-center align-items-center forgot-password-image-col">
            <img
              src="/img/image.png"
              alt="Forgot Password"
              className="forgot-password-image"
            />
          </div>

          <div className="col-lg-5 d-flex justify-content-center align-items-center bg-white">
            <div className="forgot-password-form-container">
              <h2 className="forgot-password-title">Quên mật khẩu?</h2>

              <form onSubmit={handleSubmit}>
                <div className="form-group mb-4">
                  <input
                    type="email"
                    className="form-control-custom"
                    placeholder="Nhập email tại đây"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">
                  Gửi mã OTP
                </button>
              </form>

              {isDialog && (
                <div className="otp-dialog">
                  <h5>Nhập mã OTP</h5>
                  <input
                    type="text"
                    maxLength={6}
                    className={`form-control-custom ${
                      otpError ? "is-invalid" : ""
                    }`}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <button
                    className="btn btn-primary w-100 mt-3"
                    onClick={handleOTP}
                  >
                    Xác nhận OTP
                  </button>

                  <button
                    className="btn btn-outline-secondary w-100 mt-3"
                    onClick={resendOtp}
                    disabled={timeLeft > 0}
                  >
                    Gửi lại OTP {timeLeft > 0 ? `(${timeLeft}s)` : ""}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <MainFooter />
    </>
  );
}
