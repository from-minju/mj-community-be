import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const port = process.env.PORT;
const host = process.env.HOST;
const app = express();

import authRouter from './routes/authRoutes.js';
import postsRouter from './routes/postRoutes.js';
import usersRouter from './routes/userRoutes.js';
import { logRequest } from './middleware/logMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { s3Client } from './utils/fileUtils.js';

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


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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



// Presigned URL을 생성
app.get('/api/presigned-url', async (req, res) => {
    try{
        // res.send("실행중!");
        console.log(process.env.AWS_ACCESS_KEY_ID);

        const { fileName, fileType } = req.query;
        if (!fileName || !fileType) {
            return res.status(400).json({ message: '파일 이름과 파일 타입이 필요합니다.' });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filePath = uniqueSuffix + '-' + fileName;

        // S3 PutObjectCommand 생성
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filePath,
            ContentType: fileType,
            //ACL: 'public-read' // 업로드된 파일을 공개적으로 접근 가능하도록 설정 (필요에 따라 변경 가능)
        });

        // Presigned URL 생성
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.status(200).json({
            message: 'Presigned URL 생성 성공',
            presignedUrl,
            filePath: filePath  // 업로드 후 사용할 S3 경로
        });

    } catch(error){
        console.error('[getPresignedUrlController Error]', error);
        res.status(500).json({ message: 'Presigned URL 생성 실패' });
    }

});

app.listen(port, ()=>{
    console.log(`Server is running at http://${host}:${port}`);
});

app.get('/error-test', (req, res, next) => {
    // CustomError를 이용한 테스트
    const error = new Error("테스트용 에러가 발생했습니다!");
    error.status = 400; // Bad Request
    next(error); // 에러 미들웨어로 전달
});
