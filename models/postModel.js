import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFilePath = path.join(__dirname, '../data/posts.json');


export const getAllPosts = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(postsFilePath, 'utf-8', (error, data) => {
            if(error) return reject(error);
            resolve(JSON.parse(data));
        });
    });
};

export const getPostById = async(postId) => {
    try{
        const postsData = await getAllPosts();
        const postData = postsData.find((post) => post.postId === postId);

        if(!postData){throw new Error("해당 ID의 게시물이 존재하지 않습니다.");}

        return postData;

    }catch(error){
        throw error;
    }
};

/**
 * 게시물 생성
 * @returns postId
 */
export const createPost = async(newPost) => {
    const posts = await getAllPosts();
    const postId = posts.length > 0 ? posts[posts.length - 1].postId + 1 : 1

    newPost.postId = postId;
    posts.push(newPost);

    return new Promise((resolve, reject) => {    
        fs.writeFile(postsFilePath, JSON.stringify(posts), (error) => {
            if (error) return reject(error);
            return resolve(postId);
        });
    })
    
};
