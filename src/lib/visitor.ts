import { pool } from "@/lib/db";
import { headers } from "next/headers";

export async function recordVisit() {
  try {
    const headerList = await headers();
    
    // 1. 접속자의 IP 주소 추출
    // x-forwarded-for는 프록시(Vercel 등)를 거칠 때 실제 IP를 담고 있습니다.
    const forwarded = headerList.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // 2. DB에 저장
    // SQL에서 visitedAt은 DEFAULT CURRENT_TIMESTAMP이므로 IP만 넣으면 됩니다.
    await pool.query("INSERT INTO VisitorLog (ip) VALUES (?)", [ip]);
    
    return true;
  } catch (error) {
    console.error("방문 기록 실패:", error);
    return false;
  }
}