"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react"; // 클라이언트 컴포넌트용 signIn

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    // 구글 로그인을 시작하고, 성공 시 /admin으로 이동합니다.
    await signIn("google", { callbackUrl: "/admin" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <h1 className="text-xl font-bold text-center mb-6">Admin Login</h1>
        
        <p className="text-sm text-gray-600 text-center mb-8">
          관리자 전용 페이지입니다. <br /> 등록된 Google 계정으로 로그인해주세요.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          {isLoggingIn ? (
            <span>로그인 중...</span>
          ) : (
            <>
              <img 
                src="https://authjs.dev/img/providers/google.svg" 
                alt="Google" 
                width={20} 
                height={20} 
              />
              <span>Google 계정으로 로그인</span>
            </>
          )}
        </button>

        {/* 하단 안내 문구 (선택 사항) */}
        <div className="mt-6 text-center text-xs text-gray-400">
          권한이 없는 계정은 접근이 제한됩니다.
        </div>
      </div>
    </div>
  );
}