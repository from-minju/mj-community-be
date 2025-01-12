import { v4 } from "uuid";
import { createPost, getAllPosts, getPostByPostId, editPost, deletePost,
    getCommentsByPostId, createComment, editComment, deleteComment,deleteCommentsByPostId,
    getPostImageNameByPostId,
    likePost,
    unlikePost,
    deleteLikesByPostId,
    increaseViewCount,
    getLikesByPostId,
    checkIfUserLikedPost,} from "../models/postModel.js";
import { deleteImage, getFilePath } from "../utils/fileUtils.js";
import { formatToKoreanTime } from "../utils/timeUtils.js";


/**
 * 게시물
 * --------------------------------------------------
 */

// GET 게시물 목록
export const getPostsController =async(req, res, next) => {
    try{
        const posts = await getAllPosts();
        const formattedPosts = posts.map(post => ({
            ...post,
            createdAt: formatToKoreanTime(post.createdAt),
        }));

        res.status(200).json({
            message: "게시물 목록 조회 성공",
            data: formattedPosts
        });

    } catch(error){
        next(error); // 에러 미들웨어로 전달
    }
};

// GET 게시물 상세
export const getPostController = async(req, res, next) => {

    const postId = req.params.postId;
    const userId = req.session.userId; 
    const viewedPosts = req.cookies.viewedPosts ? JSON.parse(req.cookies.viewedPosts) : [];

    // 조회수 증가 조건
    if (!viewedPosts.includes(postId)) {
        await increaseViewCount(postId);
        viewedPosts.push(postId);

        // 쿠키에 저장 (30분 유효)
        res.cookie('viewedPosts', JSON.stringify(viewedPosts), { maxAge: 1800000, httpOnly: true });
    }
    
    try{
        const post = await getPostByPostId(postId);
        const isLiked = await checkIfUserLikedPost(postId, userId);

        const postData = {
            postId: post.postId,
            title: post.title,
            content: post.content,
            postImage: post.postImage,
            createdAt: formatToKoreanTime(post.createdAt),
            likes: post.likes, 
            comments: post.comments,
            views: post.views,
            isLiked: isLiked,
            postAuthorId: post.postAuthorId,
            nickname: post.nickname,
            profileImage: post.profileImage
        }

        res.status(200).json({
            message: "게시물 상세 조회 성공",
            data: postData
        });

    }catch(error){
        next(error);
    } 
};

// POST 게시물 작성
export const createPostController = async(req, res, next) => {
    const {title, content} = req.body;
    const postId = v4();
    const userId = req.session.userId;
    const postImage = req.file ? `${req.file.filename}` : null;

    if(!title || !content){
        return res.status(400).json({ message: '유효하지 않은 요청입니다.'});
    }

    const newPost = {
        postId: postId,
        title: title,
        content: content,
        postImage: postImage,
        postAuthorId: userId
    };

    try{
        await createPost(newPost);

        res.status(201).json({
            message: "게시물 작성 성공", 
            data: {postId: postId}});

    }catch(error){
        next(error);
    }
};


export const editPostController = async(req, res, next) => {

    // const request_data = {
    //     title: "",
    //     content: "",
    //     postImage: "",
    //     isImageDeleted: true
    // }

    const postId = req.params.postId;
    const { title, content, isImageDeleted } = req.body;

    if(!title || !content){
        return res.status(400).json({ message: '유효하지 않은 요청입니다.'});
    }

    try{
        const previousImageName = await getPostImageNameByPostId(postId);

        const editedPostData = {
            title: title,
            content: content,
            postImage: previousImageName,
        }

        // 이미지가 삭제된 경우
        if (isImageDeleted === 'true') {
            editedPostData.postImage = null;

            if (previousImageName) {
                const filePath = getFilePath(previousImageName);
                deleteImage(filePath);
            }
        }

        // 이미지가 새로 업로드된 경우
        if (req.file) {
            editedPostData.postImage = req.file.filename;
        }

        // 이미지가 변경되지 않은 경우는 기존 데이터 유지
        await editPost(postId, editedPostData);

        res.status(200).json({
            message: "게시물 수정 성공",
        });

    } catch (error) {
        next(error);
    }
}


export const deletePostController = async(req, res, next) => {
    const postId = req.params.postId;

    try{
        //uploads의 이미지 삭제하기
        const previousPostImageName = await getPostImageNameByPostId(postId);
        if(previousPostImageName){
            const filePath = getFilePath(previousPostImageName);
            deleteImage(filePath);
        }
        
        await deletePost(postId);
        await deleteCommentsByPostId(postId);
        await deleteLikesByPostId(postId);

        res.status(200).json({message: "게시물 삭제 성공"});

    }catch(error){
        next(error);
    }
};


/**
 * 댓글
 * --------------------------------------------------
 */

export const getCommentsController = async(req, res, next) => {
    const postId = req.params.postId;

    try{
        const comments = await getCommentsByPostId(postId);
        const formattedComments = comments.map(comment => ({
            ...comment,
            createdAt: formatToKoreanTime(comment.createdAt),
        }));

        res.status(200).json({
            message: "댓글 목록 조회 성공",
            data: formattedComments
        });

    }catch(error){
        next(error);
    }
};

export const createCommentController = async(req, res, next) => {
    const userId = req.session.userId;
    const postId = req.params.postId;
    const {content} = req.body;

    if(!content.trim()){
        return res.status(400).json({ message: '유효하지 않은 요청입니다.'});
    }

    try{
        const newCommentData = {
            commentId: v4(),
            commentAuthorId: userId,
            content: content,
            // createdAt: getCurrentDate()
        };

        await createComment(postId, newCommentData);

        res.status(201).json({message: "댓글 작성 성공"});

    }catch(error){
        next(error);
    }
};

export const editCommentController = async(req, res, next) => {
    const {postId, commentId} = req.params;
    const { content } = req.body;
    const editedCommentData = {
        content: content,
    };

    if (!content.trim()) {
        return res.status(400).json({ message: "유효하지 않은 요청입니다." });
    }

    try{
        await editComment(postId, commentId, editedCommentData);
        res.status(200).json({ message: "댓글 수정 성공" });

    }catch(error){
        next(error);
    }
};

export const deleteCommentController = async(req, res, next) => {
    try{
        const {postId, commentId} = req.params;

        await deleteComment(postId, commentId);

        res.status(200).json({ message: "댓글 삭제 성공" });

    }catch(error){
        next(error);
    }
};


/**
 * 좋아요
 * --------------------------------------------------
 */

export const likePostController = async(req, res, next) => {
    const likeId = v4();
    const postId = req.params.postId;
    const userId = req.session.userId;

    try{
        await likePost(likeId, postId, userId);

        const likes = await getLikesByPostId(postId);

        return res.status(200).json({ 
            message: "좋아요 성공",
            data: {
                likesCnt: likes
            }
        });

    }catch(error){
        next(error);
    }
};

export const unlikePostController = async(req, res, next) => {
    const postId = req.params.postId;
    const userId = req.session.userId;

    try{
        await unlikePost(postId, userId);

        const likes = await getLikesByPostId(postId);

        return res.status(200).json({ 
            message: "좋아요 취소 성공",
            data: {
                likesCnt: likes
            }
        });

    }catch(error){
        next(error);
    }
};