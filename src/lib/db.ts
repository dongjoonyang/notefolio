import mysql from 'mysql2/promise'; // 또는 'mysql2' (프로젝트 설치 버전에 맞춰 사용)

// DB 연결 풀 생성
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD, // 비밀번호는 보안상 기본값을 두지 않는 것이 좋습니다.
  database: process.env.DB_NAME || 'portfolio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 포트 번호가 기본값(3306)과 다르다면 아래 줄도 추가 가능합니다.
  // port: Number(process.env.DB_PORT) || 3306 
});