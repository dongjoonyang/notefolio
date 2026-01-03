"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 클라이언트 사이드 보완 (미들웨어가 놓치는 찰나의 캐시 대응)
  useEffect(() => {
    if (document.cookie.includes("admin_session=true")) {
      router.replace("/admin");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      // 로그아웃 전까지 유지되도록 max-age 설정 (예: 7일)
      document.cookie = "admin_session=true; path=/; max-age=604800";
      router.refresh();
      router.replace("/admin");
    } else {
      alert("아이디 또는 비밀번호가 틀렸습니다.");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-gray-100" />; // 리다이렉트 중 폼 노출 방지

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h1 className="text-xl font-bold text-center mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded border-gray-300 outline-none focus:ring-2 focus:ring-black"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded border-gray-300 outline-none focus:ring-2 focus:ring-black"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-black text-white py-2 rounded font-bold hover:bg-gray-800 transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}