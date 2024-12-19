// 로그 미들웨어
export const logRequest = (req, res, next) => {
    const method = req.method;
    const url = req.originalUrl;
    const timestamp = new Date().toISOString();
    
    // 로그 출력
    console.log(`[${timestamp}] ${method} request to ${url}`);
    
    // 다음 미들웨어로 진행
    next();
  };
  