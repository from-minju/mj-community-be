import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

dotenv.config();

const port = process.env.PORT;
const host = process.env.HOST;
const app = express();

import authRouter from './routes/authRoutes.js';
import postsRouter from './routes/postRoutes.js';
import usersRouter from './routes/userRoutes.js';
import { logRequest } from './middleware/logMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({origin: `http://${host}:8000`,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: 'Content-Type, Authorization',
        credentials: true, // 자격 증명(쿠키, 인증 정보 등)을 허용
    })
);

app.use(
    session({
        secret: 'mySecretKey', //true
        resave: false, // 세션이 수정되지 않아도 저장할지 여부
        saveUninitialized: false, // 초기화되지 않은 세션도 저장할지 여부
        cookie: {
            secure: false, //https에서만 작동하도록 설정 (개발 환경에서는 false로 설정, 배포 환경에서는 true)
            maxAge: 1000 * 60 * 60 * 24, //쿠키유효기간설정 (1일)
        }

    })
);


app.use('/uploads', express.static('uploads')); // uploads 폴더를 정적으로 서빙

app.use(helmet()); // 순서가 express.static 뒤 이어야 함.


//로그 미들웨어 적용
app.use(logRequest);

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

app.get('/api', (req, res) => {
    res.send('Express 시작!');
});

app.listen(port, ()=>{
    console.log(port, '번 포트에서 대기 중');
});

app.get('/error-test', (req, res, next) => {
    // CustomError를 이용한 테스트
    const error = new Error("테스트용 에러가 발생했습니다!");
    error.status = 400; // Bad Request
    next(error); // 에러 미들웨어로 전달
});
