import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/dbConfig.js';
import { deleteImageFromS3 } from '../utils/fileUtils.js';
import { CustomError } from '../utils/customError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * 게시물
 * --------------------------------------------------
 */

export const getAllPosts = async () => {
    try {
        const [posts] = await pool.query(`
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
            ORDER BY p.created_at DESC
        `);
        return posts; // 결과는 카멜케이스로 매핑된 값으로 반환됩니다.
    } catch (error) {
        throw new CustomError(500, "게시물 목록 조회 실패");
    }
};


export const getPostByPostId = async(postId) => {
    try{
        const [posts] = await pool.query(`
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

        if (posts.length === 0) {
            return false;
        }

        return posts[0];

    }catch(error){
        throw error instanceof CustomError ? error : new CustomError(500, "게시물 조회 실패");
    }
};


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
        await pool.query(`
            INSERT INTO post (post_id, title, content, post_image, likes, views, comments, user_id)
            VALUES (?, ?, ?, ?, 0, 0, 0, ?)
            `, 
            [postId, title, content, postImage, postAuthorId]
        );

    }catch(error){
        throw new CustomError(500, "게시물 작성 실패");
    }
};


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
        throw new CustomError(500, "게시물 수정 실패");
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
        throw new CustomError(500, "게시물 삭제 실패");
    }
};


const getPostImageNamesArrayByUserId = async(userId) => {
    try{
        const [rows] = await pool.query(`
            SELECT post_image AS postImage
            FROM post
            WHERE user_id = ?
            `,
            [userId]
        );

        if (rows.length === 0) return [];

        return rows;

    }catch(error){
        throw new CustomError(500, "사용자가 업로드한 게시물 이미지들 이름 조회 실패");
    }
}


export const deletePostsByUserId = async (userId) => {
    try{
        const postImageNames = await getPostImageNamesArrayByUserId(userId);

        if(postImageNames.length > 0){
            for (const imageNameObj of postImageNames) {
                if(!imageNameObj.postImage){continue;}
                await deleteImageFromS3(imageNameObj.postImage);
            }
        }
        
        await pool.query(`
            DELETE FROM post
            WHERE user_id = ?
            `, 
            [userId]
        );

    }catch(error){
        throw new CustomError(500, "사용자가 작성한 게시물 삭제 실패");
    }
}


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
        throw new CustomError(500, "게시물 이미지 이름 조회 실패");

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
        throw new CustomError(500, "게시물 조회수 증가 실패");
    }
    
}


/**
 * 댓글
 * --------------------------------------------------
 */
export const getCommentByCommentId = async(commentId) => {
    try{
        const [rows] = await pool.query(`
            SELECT
                comment_id AS commentId,
                post_id AS postId,
                user_id AS commentAuthorId,
                content,
                created_at AS createdAt
            FROM comment 
            WHERE comment_id = ?

            `, 
            [commentId]
        );

        return rows[0];

    }catch(error){
        throw new CustomError(500, "게시물에 대한 댓글목록 조회 실패");
    }
}

export const getCommentsByPostId = async(postId) => {
    try{
        const [rows] = await pool.query(`
            SELECT
                c.comment_id AS commentId,
                c.content,
                c.created_at AS createdAt,
                u.user_id AS commentAuthorId,
                u.nickname,
                u.profile_image AS profileImage
            FROM comment c
            JOIN user u ON c.user_id = u.user_id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
            `, 
            [postId]
        );

        return rows;

    }catch(error){
        throw new CustomError(500, "게시물에 대한 댓글목록 조회 실패");
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
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();  // 트랜잭션 시작

        // 댓글 삽입
        const [result] = await connection.query(`
            INSERT INTO comment (comment_id, content, post_id, user_id)
            VALUES (?, ?, ?, ?)
            `,
            [commentId, content, postId, commentAuthorId]
        );

        // 삽입된 경우에만 post 테이블 업데이트
        if (result.affectedRows > 0) {
            await connection.query(`
                UPDATE post
                SET comments = comments + 1
                WHERE post_id = ?
                `,
                [postId]
            );
        }

        await connection.commit();  // 모든 쿼리 성공 시 커밋
    } catch (error) {
        await connection.rollback();  // 실패 시 롤백
        throw new CustomError(500, "댓글 등록 실패");
    } finally {
        connection.release();  // 커넥션 반환
    }

};


export const editComment = async (postId, commentId, editedCommentData) => {

    const { content } = editedCommentData;

    try{
        await pool.query(`
            UPDATE comment
            SET content = ?
            WHERE comment_id = ? AND post_id = ?
            `,
            [content, commentId, postId]
        );

    } catch(error){
        throw new CustomError(500, "댓글 수정 실패");
    }
};


export const deleteComment = async(postId, commentId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();  // 트랜잭션 시작

        // 댓글 삭제
        const [result] = await connection.query(`
            DELETE FROM comment
            WHERE comment_id = ? AND post_id = ?
            `,
            [commentId, postId]
        );

        // 댓글이 실제로 삭제된 경우에만 post 테이블 업데이트
        if (result.affectedRows > 0) {
            await connection.query(`
                UPDATE post
                SET comments = GREATEST(comments - 1, 0)
                WHERE post_id = ?
                `,
                [postId]
            );
        }

        await connection.commit();  // 모든 작업 성공 시 커밋
    } catch (error) {
        await connection.rollback();  // 실패 시 롤백
        throw new CustomError(500, "댓글 삭제 실패");
    } finally {
        connection.release();  // 커넥션 반환
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
        throw new CustomError(500, "게시물에 대한 댓글목록 삭제 실패");
    }
}


export const deleteCommentsByUserId = async(userId) => {
    const connection = await pool.getConnection();
    try{
        await connection.beginTransaction(); // 트랜잭션 시작 

        // post_id별 삭제할 댓글 수 계산
        const [result] = await connection.query(`
            SELECT post_id, COUNT(*) AS count
            FROM comment
            WHERE user_id = ?
            GROUP BY post_id
        `, [userId]);

        // 댓글 삭제
        await connection.query(`
            DELETE FROM comment
            WHERE user_id = ?
        `, [userId]);

        // post 테이블 업데이트
        for (const row of result) {
            await connection.query(`
                UPDATE post
                SET comments = GREATEST(comments - ?, 0)
                WHERE post_id = ?
            `, [row.count, row.post_id]);
        }

        await connection.commit();

    } catch(error){
        await connection.rollback();
        throw new CustomError(500, "사용자가 작성한 모든 댓글 삭제 실패");
    } finally {
        connection.release();
    }
}


/**
 * 좋아요
 * --------------------------------------------------
 */

// 현재 사용자가 특정게시물에 좋아요를 눌렀는지 확인하는 함수 (true, false)
export const checkIfUserLikedPost = async(postId, userId) => {
    try{
        const [rows] = await pool.query(`
            SELECT * 
            FROM \`like\` 
            WHERE post_id = ? AND user_id = ?
        `, [postId, userId]);

        if(rows.length > 0) {
            // 좋아요를 눌렀음
            return true;
        }else{
            // 좋아요를 누르지 않았음
            return false;
        }

    } catch(error){
        throw new CustomError(500, "사용자의 게시물에 대한 좋아요 여부 조회 실패");
    }
}

// 특정게시물의 좋아요수를 리턴하는 함수
export const getLikesByPostId = async(postId) => {
    try{
        const [rows] = await pool.query(`
            SELECT likes
            FROM post
            WHERE post_id = ?
            `,
            [postId]
        );        

        return rows[0].likes;
        
    }catch(error){
        throw new CustomError(500, "게시물에 대한 좋아요수 조회 실패");
    }
}


export const likePost = async(likeId, postId, userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();  // 트랜잭션 시작

        // 좋아요 삽입
        const [result] = await connection.query(`
            INSERT INTO \`like\` (like_id, post_id, user_id)
            VALUES (?, ?, ?)
            `,
            [likeId, postId, userId]
        );

        // 삽입 성공 시에만 post 테이블 업데이트
        if (result.affectedRows > 0) {
            await connection.query(`
                UPDATE post
                SET likes = likes + 1
                WHERE post_id = ?
                `,
                [postId]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw new CustomError(500, "좋아요 실패");
    } finally {
        connection.release();
    }

};


export const unlikePost = async(postId, userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();  // 트랜잭션 시작

        // 좋아요 삭제
        const [result] = await connection.query(`
            DELETE FROM \`like\`
            WHERE post_id = ? AND user_id = ?
            `,
            [postId, userId]
        );

        // 좋아요가 삭제된 경우에만 post 테이블 업데이트
        if (result.affectedRows > 0) {
            await connection.query(`
                UPDATE post
                SET likes = GREATEST(likes - 1, 0)
                WHERE post_id = ?
                `,
                [postId]
            );
        }

        await connection.commit();  // 모든 쿼리 성공 시 커밋
    } catch (error) {
        await connection.rollback();  // 실패 시 롤백
        throw new CustomError(500, "좋아요 취소 실패");
    } finally {
        connection.release();  // 커넥션 반환
    }
};


export const deleteLikesByPostId = async(postId) => {
    try{
        await pool.query(`
            DELETE FROM \`like\`
            WHERE post_id = ?
            `,
            [postId]
        );

    }catch(error){
        throw new CustomError(500, "게시물에 대한 좋아요 목록 삭제 실패");
    }
}


export const deleteLikesByUserId = async(userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 삭제할 좋아요 수 계산
        const [result] = await connection.query(`
            SELECT post_id, COUNT(*) AS count
            FROM \`like\`
            WHERE user_id = ?
            GROUP BY post_id
        `, [userId]);

        // 좋아요 삭제
        await connection.query(`
            DELETE FROM \`like\`
            WHERE user_id = ?
        `, [userId]);

        // post 테이블 업데이트
        for (const row of result) {
            await connection.query(`
                UPDATE post
                SET likes = GREATEST(likes - ?, 0)
                WHERE post_id = ?
            `, [row.count, row.post_id]);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw new CustomError(500, "사용자의 모든 좋아요 삭제 실패");
    } finally {
        connection.release();
    }
}


