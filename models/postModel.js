import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 } from 'uuid';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFilePath = path.join(__dirname, '../data/posts.json');
const commentsFilePath = path.join(__dirname, '../data/comments.json');
const likesFilePath = path.join(__dirname, '../data/likes.json');


/**
 * 게시물
 * --------------------------------------------------
 */

export const getAllPosts = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.post_id AS postId, 
                p.title,
                p.created_at AS createdAt,  
                p.likes, 
                p.views, 
                p.comments, 
                u.nickname, 
                u.profile_image AS profileImage
            FROM post p
            JOIN user u ON p.user_id = u.user_id
        `);
        return rows; // 결과는 카멜케이스로 매핑된 값으로 반환됩니다.
    } catch (error) {
        throw error;
    }
};


export const getPostByPostId = async(postId) => {
    try{
        const [rows] = await pool.query(`
            SELECT 
                p.post_id AS postId, 
                p.title, 
                p.content, 
                p.created_at AS createdAt, 
                p.post_image AS postImage, 
                p.likes, 
                p.views, 
                p.comments, 
                u.user_id AS postAuthorId, 
                u.nickname, 
                u.profile_image AS profileImage
            FROM post p 
            JOIN user u ON p.user_id = u.user_id
            WHERE p.post_id = ?
            `,
            [postId]
        );

        if (rows.length === 0) {
            throw new Error('해당 ID의 게시물이 존재하지 않습니다.');
        }

        // 디버깅용
        console.log(rows[0]);

        return rows[0];

    }catch(error){
        throw error;
    }
};


/**
 * 게시물 생성
 * @returns postId
 */
export const createPost = async(newPost) => {

    /** newPost 형식
        const newPost = {
            postId: v4(),
            title: title,
            content: content,
            postImage: postImage,
            //생략 createdAt: getCurrentDate(), 
            //생략 likes: 0, 
            //생략 views: 0, 
            //생략 comments: 0, 
            postAuthorId: userId
        };
    */

    const {postId, title, content, postImage, postAuthorId} = newPost

    try{
        const result = await pool.query(`
            INSERT INTO post (post_id, title, content, post_image, likes, views, comments, user_id)
            VALUES (?, ?, ?, ?, 0, 0, 0, ?)
            `, 
            [postId, title, content, postImage, postAuthorId]
        );

        return result[0].post_id;

    }catch(error){
        throw error;
    }
};

// TODO: 이미지 바뀌지 않은 경우에 대한 처리...등
export const editPost = async (postId, editedPostData) => {

    const {title, content, postImage} = editedPostData;

    try{
        await pool.query(`
            UPDATE post
            SET title = ?, content = ?, post_Image = ?
            WHERE post_id = ?
            `, 
            [title, content, postImage, postId]
        );

    }catch(error){
        throw error;
    }
};


export const deletePost = async (postId) => {
    try{
        await pool.query(`
            DELETE FROM post
            WHERE post_id = ?
            `, 
            [postId]
        );

    }catch(error){
        throw error;
    }
};


export const getPostImageNameByPostId = async(postId) => {
    try{
        const [rows] = await pool.query(`
            SELECT post_image AS postImage
            FROM post
            WHERE post_id = ?
            `,
            [postId]
        );

        if (rows.length === 0) return false;

        return rows[0].postImage;

    }catch(error){
        throw error;
    }
}

export const increaseViewCount = async(postId) => {

    try{
        await pool.query(`
            UPDATE post 
            SET views = views + 1
            WHERE post_id = ?
            `,
            [postId]
        );

    }catch(error){
        throw error;
    }
    
}


/**
 * 댓글
 * --------------------------------------------------
 */
// const getAllComments = async() => {
//     const data = await fs.readFile(commentsFilePath, 'utf-8');
//     return JSON.parse(data);
// };

export const getCommentsByPostId = async(postId) => {
    try{
        const [rows] = await pool.query(`
            SELECT
                c.comment_id AS commentId,
                c.content
                c.created_at AS createdAt,
                u.user_id AS commentAuthorId,
                u.nickname
                u.profile_image AS profileImage
            FROM comment c
            JOIN user u ON c.user_id = u.user_id
            WHERE c.post_id = ?
            `, 
            [postId]
        );

        return rows;

    }catch(error){
        throw error;
    }
};

export const createComment = async(postId, newCommentData) => {
    /** newCommentData 형식
        const newCommentData = {
            commentId: v4(),
            content: content,
            //생략 createdAt: getCurrentDate(),
            commentAuthorId: userId,
        };
    */

    const { commentId, content, commentAuthorId } = newCommentData;

    try{
        await pool.query(`
            INSERT INTO comment (comment_id, content, post_id, user_id)
            VALUES (?, ?, ?, ?)
            `,
            [commentId, content, postId, commentAuthorId]
        );

    }catch(error){
        throw error;
    }
};


export const editComment = async (postId, commentId, editedCommentData) => {

    const { content } = editedCommentData;

    try{
        await pool.query(`
            UPDATE comment
            SET content = ?
            WHERE comment_id = ? ? AND post_id = ?
            `,
            [content, commentId, postId]
        );

    } catch(error){
        throw error;
    }
};


export const deleteComment = async(postId, commentId) => {

    try{
        await pool.query(`
            DELETE FROM comment
            WHERE comment_id = ? AND post_id = ?
            `,
            [commentId, postId]
        );
    } catch(error){
        throw error;
    }
    
};


export const deleteCommentsByPostId = async(postId) => {
    try{
        await pool.query(`
            DELETE FROM comment
            WHERE post_id = ?
            `,
            [postId]
        );
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
