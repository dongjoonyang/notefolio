import mysql from 'mysql2/promise';

// 글로벌 타입 선언 (TypeScript 에러 방지)
const globalForMysql = global as unknown as { pool: mysql.Pool };

export const pool =
  globalForMysql.pool ||
  mysql.createPool({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 25756,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
    // 서버리스 환경에 최적화된 설정
    waitForConnections: true,
    connectionLimit: 3, // 연결 개수를 더 줄여서 안정성 확보
    maxIdle: 3, // 유휴 연결 제한
    idleTimeout: 60000, // 60초 후 유휴 연결 해제
    queueLimit: 0,
    enableKeepAlive: true,
  });

// 개발 환경에서는 글로벌 객체에 저장하여 핫 리로딩 시 재사용
if (process.env.NODE_ENV !== 'production') globalForMysql.pool = pool;