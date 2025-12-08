'use client';
import { useContext } from "react"; // ✅ thêm dòng này
import { LoadingContext } from "@/app/context/LoadingContext";
import { handleApiError } from "@/app/services/handleAPIErr";
import { useAuthDialog } from "@/app/context/AuthDialogContext";

export const useApi = (showToast, showLoading = true) => {
  
  const { setLoading } = useContext(LoadingContext); // dùng useContext
  const { showDialog } = useAuthDialog();

  const callApi = async (apiFunc, opShowToast = true, skipAuth = false) => {
    const token = localStorage.getItem("token") || null;

    if (!token && !skipAuth) {
      showDialog("loginRequired");
      throw new Error("Chưa đăng nhập");
    }

    try {
      if (showLoading) setLoading(true);
      const res = await apiFunc();
      

      const contentType = res?.headers?.["content-type"];

      if (
        contentType?.includes("application/pdf") ||
        contentType?.includes("application/octet-stream") ||
        contentType?.includes("application/vnd")
      ) {
        return res;
      }

      return res.data;
    } catch (err) {
      console.log(err);
      
      if (err?.response?.status === 401) {
        showDialog("expired");
      } else {
        handleApiError(err, showToast, opShowToast);
      }
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  return { callApi };
};
