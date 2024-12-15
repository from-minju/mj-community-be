import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFilePath = path.join(__dirname, '../data/posts.json');
const commentsFilePath = path.join(__dirname, '../data/comments.json');
const likesFilePath = path.join(__dirname, '../data/likes.json');


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

        posts.push(newPost);

        await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');

        return newPost.postId;

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


export const getPostImageNameByPostId = async(postId) => {
    try{
        const postsData = await getAllPosts();
        const postData = postsData.find((post) => post.postId === postId);

        if(!postData){
            return false;
        }

        return postData.postImage;

    }catch(error){
        throw error;
    }
}

export const increaseViewCount = async(postId) => {
    try{
        const posts = await getAllPosts();
        const postIndex = posts.findIndex((post) => post.postId === postId);
        const views = posts[postIndex].views;
    
        if (postIndex === -1) {
            throw new Error('게시물을 찾을 수 없습니다.');
        }
    
        posts[postIndex] = {
            ...posts[postIndex],
            views: views + 1
        }; 

        await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');

    }catch(error){
        throw error;
    }

}


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
        const postComments = allComments[postId] || [];

        return postComments;
    }catch(error){
        throw error;
    }
};

export const createComment = async(postId, newCommentData) => {
    try{
        const allComments = await getAllComments();
        const newComment = {
            ...newCommentData,
            commentId: v4(),
        }

        if(!allComments[postId]){
            allComments[postId] = [];
        }

        allComments[postId].push(newComment);

        await fs.writeFile(commentsFilePath, JSON.stringify(allComments, null, 2), 'utf-8');
        
    }catch(error){
        throw error;
    }
};


export const editComment = async (postId, commentId, editedCommentData) => {
    try{
        const allComments = await getAllComments();
        const postComments = allComments[postId];
        const commentIndex = postComments.findIndex(
            (comment) => comment.commentId === commentId
        );

        allComments[postId][commentIndex] = {
            ...postComments[commentIndex],
            ...editedCommentData
        };

        await fs.writeFile(commentsFilePath, JSON.stringify(allComments, null, 2), 'utf-8');
        
    } catch(error){
        throw error;
    }
};


export const deleteComment = async(postId, commentId) => {
    try{
        const allComments = await getAllComments();
        const postComments = allComments[postId];
        const commentIndex = postComments.findIndex(
            (comment) => comment.commentId === commentId
        );

        allComments[postId].splice(commentIndex, 1);

        await fs.writeFile(commentsFilePath, JSON.stringify(allComments, null, 2), 'utf-8');

    } catch(error){
        throw error;
    }
};


export const deleteCommentsByPostId = async(postId) => {
    try{
        const allComments = await getAllComments();
        delete allComments[postId];

        await fs.writeFile(commentsFilePath, JSON.stringify(allComments, null, 2), 'utf-8');
        
    }catch(error){
        throw error;
    }
}



/**
 * 좋아요
 * --------------------------------------------------
 */

const getAllLikes = async() => {
    const data = await fs.readFile(likesFilePath, 'utf-8');
    return JSON.parse(data);
};

export const getAllLikesByPostId = async(postId) => {
    const allLikes = await getAllLikes();
    return allLikes[postId] || [];
}

export const getLikesByPostId = async(postId) => {
    try{
        const allLikes = await getAllLikes();
        const postLikes = allLikes[postId] || [];

        return postLikes;
    }catch(error){
        throw error;
    }
};

export const likePost = async(postId, userId) => {
    try{
        const allLikes = await getAllLikes();

        if(!allLikes[postId]){
            allLikes[postId] = [];
        }
        allLikes[postId].push(userId);

        await fs.writeFile(likesFilePath, JSON.stringify(allLikes, null, 2), 'utf-8');

    }catch(error){
        throw error;
    }

};

export const unlikePost = async(postId, userId) => {
    try{
        const allLikes = await getAllLikes();
        const newPostLikes  = allLikes[postId].filter(item => item !== userId);
        allLikes[postId] = newPostLikes;

        await fs.writeFile(likesFilePath, JSON.stringify(allLikes, null, 2), 'utf-8');

    }catch(error){
        throw error;
    }
};

export const deleteLikesByPostId = async(postId) => {
    try{
        const allLikes = await getAllLikes();
        delete allLikes[postId];

        await fs.writeFile(likesFilePath, JSON.stringify(allLikes, null, 2), 'utf-8');
        
    }catch(error){
        throw error;
    }
}
