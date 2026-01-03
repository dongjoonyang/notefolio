import mysql from 'mysql2/promise';

// DB 연결 풀 생성
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  // Aiven은 보통 3306이 아닌 다른 포트를 줄 때가 많으므로 반드시 환경변수 처리를 해줍니다.
  port: Number(process.env.DB_PORT) || 3306, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // ✅ Aiven 배포를 위한 핵심 설정
  ssl: {
    rejectUnauthorized: false, // 별도의 인증서 파일 없이 연결하기 위한 옵션
  },
  
  waitForConnections: true,
  connectionLimit: 5, // 무료 티어이므로 연결 수를 약간 줄이는 것이 안정적입니다.
  queueLimit: 0,
  enableKeepAlive: true, // 연결 유지 성능 향상
});