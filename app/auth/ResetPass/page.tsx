"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainHeader from "@/app/components/layout/Header";
import MainFooter from "@/app/components/layout/Footer";
import { useToast } from "@/app/hooks/useToast";
import { useApi } from "@/app/hooks/useApi";
import authApi from "@/app/services/api/authAPI";
import { isValidPassword } from "@/app/services/ultis/validator";
import { LoadingContext } from "@/app/context/LoadingContext";


export default function ResetPass() {
  const router = useRouter();
  const { showToast } = useToast();
  const { callApi } = useApi(showToast);
  const { loading, setLoading } = useContext(LoadingContext);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const [errors, setErrors] = useState({
    otp: false,
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (!savedEmail) {
      showToast.error("Email không tồn tại");
    return; 
    }
    setEmail(savedEmail);

    const expire = localStorage.getItem("otpExpire");
    if (expire) {
      const remain = Math.floor((parseInt(expire) - Date.now()) / 1000);
      if (remain > 0) setTimeLeft(remain);
      else localStorage.removeItem("otpExpire");
    }
  }, []);

  
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

  const validate = () => {
    const e = {
      otp: otp.length !== 6,
      password: !isValidPassword(newPassword),
      confirmPassword: newPassword !== confirmPassword,
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };


  const handleReset = async () => {
    if (!validate()) return;

    try {
    await callApi(() => authApi.reset_password({ email, otp, newPassword }));
        showToast("success", "Thành công", "Đổi mật khẩu thành công!");
        localStorage.removeItem("resetEmail");
        router.push("/auth/login"); 
    } catch (err: any) {
        showToast(
            "error",
            "Thất bại",
            err?.response?.data?.message || "Đổi mật khẩu thất bại!"
        );
    }

  };

  // Gửi lại OTP
  const handleResend = async () => {
    const expire = Date.now() + 60000;
    localStorage.setItem("otpExpire", expire.toString());
    setTimeLeft(60);

    try {
      await callApi(() => authApi.resend_otp({ email }), true, true);
      showToast("success", "Thành công", "Gửi lại mã OTP thành công!");
    } catch {}
  };

  return (
    <>
    <MainHeader />
      <div className="forgot-password-container container-fluid vh-100 p-0">
        <div className="row h-100 g-0">
          <div className="col-lg-7 d-none d-lg-flex justify-content-center align-items-center forgot-password-image-col">
            <img src="/img/image.png" 
            alt="Forgot Password" 
            className="forgot-password-image" />
          </div>
        </div>
      </div>

      <div className="container py-5">
        <h3 className="mb-4">Đặt lại mật khẩu</h3>

        <p>Email: <strong>{email}</strong></p>

        {/* OTP */}
        <div className="mb-3">
          <label>Mã OTP</label>
          <input
            className={`form-control ${errors.otp ? "is-invalid" : ""}`}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="Nhập OTP"
          />
          {errors.otp && <div className="invalid-feedback">OTP không hợp lệ</div>}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label>Mật khẩu mới</label>
          <input
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới"
          />
          {errors.password && (
            <div className="invalid-feedback">
              Mật khẩu phải tối thiểu 8 ký tự, có chữ HOA, thường, số.
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-3">
          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
          />
          {errors.confirmPassword && (
            <div className="invalid-feedback">Mật khẩu không khớp</div>
          )}
        </div>

        {/* Resend OTP + time */}
        <div className="mb-3">
          {timeLeft > 0 ? (
            <span>Gửi lại OTP sau: {timeLeft}s</span>
          ) : (
            <button className="btn btn-link p-0" onClick={handleResend}>
              Gửi lại OTP
            </button>
          )}
        </div>

        <button className="btn btn-danger w-100" onClick={handleReset}>
          Đặt lại mật khẩu
        </button>

        <div className="mt-3 text-center">
          <Link href="/auth/login">Quay lại đăng nhập</Link>
        </div>
      </div>

      <MainFooter />
    </>
  );
}
