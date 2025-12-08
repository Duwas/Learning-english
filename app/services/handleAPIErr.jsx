export const handleApiError = (error, showToast, opShowToast = true) => {
  if (!opShowToast) return;

  if (error.response) {
    switch (error.response.status) {
      case 400:
        showToast(
          "error",
          "Thất bại",
          error.response.data?.message || "Vui lòng kiểm tra lại"
        );
        break;
      case 404:
        showToast(
          "error",
          "Cảnh báo",
          error.response.data?.message || "Vui lòng kiểm tra lại"
        );
        break;
      case 403:
        showToast(
          "error",
          "Không có quyền",
          "Bạn không được phép thực hiện hành động này"
        );
        break;
      case 500:
        showToast("error", "Lỗi hệ thống", "Vui lòng thử lại sau");        
        break;
      default:
        showToast(
          "error",
          "Lỗi",
          error.response.data?.message || "Có sự cố xảy ra"
        );
    }
  } else if (error.request) {
    showToast(
      "error",
      "Mất kết nối",
      "Hiện tại hệ thống không khả dụng, vui lòng thử lại sau"
    );
  } else {
    showToast("error", "Lỗi không xác định", error.message);
  }
};