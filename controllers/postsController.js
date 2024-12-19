import { v4 } from "uuid";
import path from 'path';
import { createPost, getAllPosts, getPostByPostId, editPost, deletePost,
    getCommentsByPostId, createComment, editComment, deleteComment,deleteCommentsByPostId,
    getPostImageNameByPostId,
    likePost,
    unlikePost,
    deleteLikesByPostId,
    increaseViewCount,
    getLikesByPostId,
    checkIfUserLikedPost,} from "../models/postModel.js";
import { upload } from "../middleware/multer.js";
import { deleteImage, getFilePath } from "../utils/fileUtils.js";
import { getUserById } from "../models/userModel.js";


function getCurrentDate() {
    let today = new Date();
    today.setHours(today.getHours() + 9); // 미국시간 기준이니까 9를 더해주면 대한민국 시간됨
    return today.toISOString().replace("T", " ").substring(0, 19); // 문자열로 바꿔주고 T를 빈칸으로 바꿔주면 yyyy-mm-dd hh:mm:ss 이런 형식 나옴
}



/**
 * 게시물
 * --------------------------------------------------
 */

// GET 게시물 목록
export const getPostsController =async(req, res) => {
    try{
        const posts = await getAllPosts();

        res.status(200).json({
            message: "게시물 목록 조회 성공",
            data: posts
        });

    } catch(error){
        console.log(error); //getAllPosts의 reject()인자 리턴됨
        res.status(500).json({message: "게시물 목록 조회 실패"});
    }
};

// GET 게시물 상세
export const getPostController = async(req, res) => {

    const postId = req.params.postId;
    const userId = req.session.userId; 
    const viewedPosts = req.cookies.viewedPosts ? JSON.parse(req.cookies.viewedPosts) : [];

    if(!userId){
        return res.status(401).json({message: "로그인 필요"});
    }

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
            createdAt: post.createdAt, //TODO2: 시간 변환 
            likes: post.likes, 
            comments: post.comments,
            views: post.views,
            isLiked: isLiked,
            postAuthorId: post.postAuthorId,
            nickname: post.nickname,
            profileImage: post.profileImage
        }

        // LOG
        console.log("<postData> : ", postData);

        res.status(200).json({
            message: "게시물 상세 조회 성공",
            data: postData
        });

    }catch(error){
        console.log(error); // getPostById의 throw() 인자 리턴됨
        res.status(404).json({message: "게시물 상세 조회 실패"});
    } 
};

// POST 게시물 작성
export const createPostController = async(req, res) => {
    const {title, content} = req.body;
    const postId = v4();
    const userId = req.session.userId;
    const postImage = req.file ? `${req.file.filename}` : null;

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
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};

// TODO
export const editPostController = async(req, res) => {
    // upload.single('postImage')(req, res, async(err) => {
    //     if(err){
    //         console.error("Multer error: ", err);
    //         return res.status(400).json({ message: '파일 업로드 실패', error: err.message });
    //     }

    //     const postId = req.params.postId;
    //     const {title, content} = req.body;
    //     const postImage = req.file ? `${req.file.filename}` : null;

    //     const editedPostData = {
    //         title: title,
    //         content: content,
    //     }

    //     if(req.file){
    //         editedPostData.postImage = postImage;

    //         //uploads의 기존 이미지 삭제하기
    //         const previousImageName = await getPostImageNameByPostId(postId);
    //         if(previousImageName){
    //             const filePath = getFilePath(previousImageName);
    //             deleteImage(filePath);
    //         }
    //     }

    //     try{
    //         await editPost(postId, editedPostData);
    //         res.status(200).json({
    //             message: "게시물 수정 성공",
    //         });
    //     }catch(error){
    //         console.log(error);
    //         res.status(500).json({message: "서버 에러 발생"});
    //     }
    // });

}


export const deletePostController = async(req, res) => {
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
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};


/**
 * 댓글
 * --------------------------------------------------
 */

export const getCommentsController = async(req, res) => {
    const postId = req.params.postId;

    try{
        const comments = await getCommentsByPostId(postId);

        res.status(200).json({
            message: "댓글 목록 조회 성공",
            data: comments
        });

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};

export const createCommentController = async(req, res) => {
    const userId = req.session.userId;
    const postId = req.params.postId;
    const {content} = req.body;

    if (!userId) {
        return res.status(401).json({ message: "로그인 필요" });
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
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};

export const editCommentController = async(req, res) => {
    try{
        const {postId, commentId} = req.params;
        const {content} = req.body;
        const editedCommentData = {
            content: content,
        };

        await editComment(postId, commentId, editedCommentData);
        res.status(200).json({ message: "댓글 수정 성공" });

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};

export const deleteCommentController = async(req, res) => {
    try{
        const {postId, commentId} = req.params;

        await deleteComment(postId, commentId);

        res.status(200).json({ message: "댓글 삭제 성공" });

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};


/**
 * 좋아요
 * --------------------------------------------------
 */

export const likePostController = async(req, res) => {
    const likeId = v4();
    const postId = req.params.postId;
    const userId = req.session.userId;

    if(!userId){
        return res.status(401).json({ message: "로그인 필요" });
    }

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
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};

export const unlikePostController = async(req, res) => {
    const postId = req.params.postId;
    const userId = req.session.userId;

    if(!userId){
        return res.status(401).json({ message: "로그인 필요" });
    }

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
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};