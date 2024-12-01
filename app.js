import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';

const port = process.env.PORT || 3000;
const app = express();
dotenv.config();

import authRouter from './routes/authRoutes.js';
import postsRouter from './routes/postsRoutes.js';
import usersRouter from './routes/usersRoutes.js';

app.use(express.json());

app.use(
    cors({origin: "http://localhost:8000",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: 'Content-Type, Authorization',
        credentials: true, // 자격 증명(쿠키, 인증 정보 등)을 허용
    })
);

app.use(
    session({
        secret: 'mySecretKey',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false, //https에서만 작동하도록 설정 (개발 환경에서는 false로 설정, 배포 환경에서는 true)
            maxAge: 1000 * 60 * 60 * 24, //쿠키유효기간설정 (1일)
        }

    })
);

app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);


app.get('/', (req, res) => {
    res.send('Express 시작!');
});

app.get('/data', (req,res) => {
    res.json("[server] 데이터 가져오기 성공!!!");
})

app.listen(port, ()=>{
    console.log(port, '번 포트에서 대기 중');
});
