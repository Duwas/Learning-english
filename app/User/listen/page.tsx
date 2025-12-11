"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ListeningRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/User/listen/A1");
  }, [router]);

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>Đang chuyển hướng đến bài học Cấp độ A1...</h2>
      <p>Vui lòng chờ trong giây lát.</p>
    </div>
  );
}
 