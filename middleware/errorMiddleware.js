import { getKoreanTime } from "../utils/timeUtils.js";

export const errorHandler = (err, req, res, next) => {
    const time = getKoreanTime();
    console.error(
        `[${time}] ${req.method} ${req.originalUrl} | status: ${err.statusCode}, message: ${err.message}
          ${err.stack}`,
    );

    const status = err.status || 500;
    const message = err.message || "서버 에러 발생";

    return res.status(status).json({ message,});
};