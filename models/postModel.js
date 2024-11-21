import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFilePath = path.join(__dirname, '../data/posts.json');
const commentsFilePath = path.join(__dirname, '../data/comments.json');

/**
 * 게시물
 * --------------------------------------------------
 */

export const getAllPosts = async() => {
    try{
        const data = await fs.readFile(postsFilePath, 'utf-8');
        return JSON.parse(data);

    }catch(error){
        throw error;
    }
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
    try{
        const posts = await getAllPosts();
        const postId = posts.length > 0 ? posts[posts.length - 1].postId + 1 : 1

        newPost.postId = postId;
        posts.push(newPost);

        await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');

        return postId;

    }catch(error){
        throw error;
    }
};


export const editPost = async (postId, editedPostData) => {
    try{
        const posts = await getAllPosts();
        const postIndex = posts.findIndex((post) => post.postId === postId);
    
        if (postIndex === -1) {
            throw new Error('게시물을 찾을 수 없습니다.');
        }
    
        posts[postIndex] = {
            ...posts[postIndex],
            ...editedPostData,
        }; 

        await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');

    }catch(error){
        throw error;
    }
};


export const deletePost = async (postId) => {
    try{
        const posts = await getAllPosts();
        const postIndex = posts.findIndex((post) => post.postId === postId);
    
        if (postIndex === -1) {
            throw new Error('게시물을 찾을 수 없습니다.');
        }
    
        posts.splice(postIndex, 1);

        await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');

    }catch(error){
        throw error;
    }
};


/**
 * 댓글
 * --------------------------------------------------
 */
const getAllComments = async() => {
    const data = await fs.readFile(commentsFilePath, 'utf-8');
    return JSON.parse(data);
};

export const getCommentsByPostId = async(postId) => {
    try{
        const allComments = await getAllComments();
        const postComments = allComments[postId];

        return postComments;
    }catch(error){
        throw error;
    }
};

export const createComment = async(postId, newCommentData) => {

};