import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const port = process.env.PORT || 3000;
const app = express();
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import postsRoutes from './routes/postsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';

app.use(cors({
    origin: "http://localhost:8000",
}));

app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/users', usersRoutes);


app.get('/', (req, res) => {
    res.send('Express 시작!');
});

app.get('/data', (req,res) => {
    res.json("[server] 데이터 가져오기 성공!!!");
})

app.listen(port, ()=>{
    console.log(port, '번 포트에서 대기 중');
});
