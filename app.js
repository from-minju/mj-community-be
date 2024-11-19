import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const port = process.env.PORT || 3000;
const app = express();
dotenv.config();

import authRouter from './routes/authRoutes.js';
import postsRouter from './routes/postsRoutes.js';
import usersRouter from './routes/usersRoutes.js';

app.use(cors({
    origin: "http://localhost:8000",
}));

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
