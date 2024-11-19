import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFilePath = path.join(__dirname, '../data/posts.json');

export const getAllPosts = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(postsFilePath, 'utf-8', (err, data) => {
            if(err) return reject({message: "전체 게시물 조회 실패", error: err});
            // if(err) return reject("전체 게시물 조회 실패");
            resolve(JSON.parse(data));
        });
    });
};