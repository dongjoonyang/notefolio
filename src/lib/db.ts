import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  // 👈 스크린샷에 적으신 이름과 똑같이 'DATABASE_'를 붙여야 합니다.
  host: process.env.DATABASE_HOST, 
  port: Number(process.env.DATABASE_PORT) || 25756, // Aiven 포트에 맞춰 수정
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
  
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
});