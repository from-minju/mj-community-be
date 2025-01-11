// 인증 여부 확인 미들웨어
export function checkAuth(req, res, next) {
    if(req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: "로그인이 필요합니다."});
}