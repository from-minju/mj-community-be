import { getKoreanTime } from "../utils/timeUtils.js";

// 로그 미들웨어
export const logRequest = (req, res, next) => {
    const method = req.method;
    const url = req.originalUrl;
    const time = getKoreanTime();
    
    // 로그 출력
    console.log(`[${time}] ${method} request to ${url}`);
    
    // 다음 미들웨어로 진행
    next();
  };
  