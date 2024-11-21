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
        fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8', (error) => { //2: 한줄로 저장되지 않게 하기 위함. 2번 들여쓰기.
            if (error) return reject(error);
            return resolve(postId);
        });
    })
};


export const editPost = async (postId, editedPostData) => {
    const posts = await getAllPosts();
    const postIndex = posts.findIndex((post) => post.postId === postId);

    if (postIndex === -1) {
        throw new Error('게시물을 찾을 수 없습니다.');
    }

    posts[postIndex] = {
        ...posts[postIndex],
        ...editedPostData,
    }; 

    return new Promise((resolve, reject) => {
        fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8', (error) => {
            if(error){
                return reject(err);
            }
            resolve();
        });
    });
};


export const deletePost = async (postId) => {
    const posts = await getAllPosts();
    const postIndex = posts.findIndex((post) => post.postId === postId);

    if (postIndex === -1) {
        throw new Error('게시물을 찾을 수 없습니다.');
    }

    posts.splice(postIndex, 1);

    return new Promise((resolve, reject) => {
        fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8', (error) => {
            if(error){
                return reject(err);
            }
            resolve();
        })
    });

};