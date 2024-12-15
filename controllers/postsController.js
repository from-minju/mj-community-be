import { v4 } from "uuid";
import path from 'path';
import { createPost, getAllPosts, getPostById, editPost, deletePost,
    getCommentsByPostId, createComment, editComment, deleteComment,deleteCommentsByPostId,
    getPostImageNameByPostId,
    getLikesByPostId,
    likePost,
    getAllLikesByPostId,
    unlikePost,
    deleteLikesByPostId,} from "../models/postModel.js";
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
    let postsData = [];

    try{
        const posts = await getAllPosts();

        for(const post of posts){

            const postId = post.postId;
            const postAuthor = await getUserById(post.postAuthorId);
    
            const comments = await getCommentsByPostId(postId);
            const numComments = comments ? comments.length : 0;

            const likes = await getLikesByPostId(postId);
            const numLikes = likes ? likes.length : 0;

            const postData = {
                postId: postId,
                title: post.title,
                createdAt: post.createdAt,
                likes: numLikes,
                comments: numComments,
                views: post.views,
                nickname: postAuthor.nickname,
                profileImage: postAuthor.profileImage
            };

            postsData.push(postData);
        }

        res.status(200).json({
            message: "게시물 목록 조회 성공",
            data: postsData
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

    if(!userId){
        return res.status(401).json({message: "로그인 필요"});
    }

    
    try{
        const post = await getPostById(postId);
        const postAuthor = await getUserById(post.postAuthorId);

        const comments = await getCommentsByPostId(postId);
        const numComments = comments ? comments.length : 0;

        const likes = await getLikesByPostId(postId);
        const numLikes = likes ? likes.length : 0;

        const postData = {
            postId: post.postId,
            title: post.title,
            content: post.content,
            postImage: post.postImage,
            createdAt: post.createdAt,
            likes: numLikes, 
            comments: numComments,
            views: post.views, // TODO: 
            postAuthorId: postAuthor.userId,
            nickname: postAuthor.nickname,
            profileImage: postAuthor.profileImage
        }

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
    const userId = req.session.userId;
    const postImage = req.file ? `${req.file.filename}` : null;

    const newPost = {
        postId: v4(),
        title: title,
        content: content,
        postImage: postImage,
        createdAt: getCurrentDate(), 
        views: 0,
        postAuthorId: userId
    };

    try{
        const postId = await createPost(newPost);

        res.status(201).json({
            message: "게시물 작성 성공", 
            data: {postId: postId}});

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};


export const editPostController = async(req, res) => {
    upload.single('postImage')(req, res, async(err) => {
        if(err){
            console.error("Multer error: ", err);
            return res.status(400).json({ message: '파일 업로드 실패', error: err.message });
        }

        const postId = req.params.postId;
        const {title, content} = req.body;
        const postImage = req.file ? `${req.file.filename}` : null;

        const editedPostData = {
            title: title,
            content: content,
        }

        if(req.file){
            editedPostData.postImage = postImage;

            //uploads의 기존 이미지 삭제하기
            const previousImageName = await getPostImageNameByPostId(postId);
            if(previousImageName){
                const filePath = getFilePath(previousImageName);
                deleteImage(filePath);
            }
        }

        try{
            await editPost(postId, editedPostData);
            res.status(200).json({
                message: "게시물 수정 성공",
            });
        }catch(error){
            console.log(error);
            res.status(500).json({message: "서버 에러 발생"});
        }
    });
    //TODO: 사용자 Id로 프로필사진, 닉네임 가져오기/ posts.json에도 사용자id만 넣어두기.
    //TODO: 이미지 파일이 바뀌면, 기존의 이미지 파일은 삭제하기. 
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
    let commentsData = [];

    try{
        const comments = await getCommentsByPostId(postId);

        for(const comment of comments){

            const commentAuthor = await getUserById(comment.commentAuthorId);

            const commentData = {
                commentId: comment.commentId,
                content: comment.content,
                createdAt: comment.createdAt,
                commentAuthorId: comment.commentAuthorId,
                nickname: commentAuthor.nickname,
                profileImage: commentAuthor.profileImage
            }
            
            commentsData.push(commentData);
        }

        res.status(200).json({
            message: "댓글 목록 조회 성공",
            data: commentsData
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
            createdAt: getCurrentDate()
        };

        await createComment(postId, newCommentData);

        res.status(201).json({message: "댓글 작성 성공"});

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};

export const editCommentController = async(req, res) => {
    //TODO: 인증/인가 확인후 로직 실행하기.
    
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

export const getLikesController = async(req, res) => {

    const postId = req.params.postId;
    const userId = req.session.userId;

    if(!userId){
        return res.status(401).json({ message: "로그인 필요" });
    }

    try{
        const postLikes = await getAllLikesByPostId(postId);
        let isLiked = postLikes.some(tempUserId => tempUserId === userId);

        res.status(200).json({
            message: "좋아요 조회 성공",
            data: {
                isLiked: isLiked,
                likesCnt: postLikes.length,
            }
        })

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }

}

export const likePostController = async(req, res) => {
    const postId = req.params.postId;
    const userId = req.session.userId;

    if(!userId){
        return res.status(401).json({ message: "로그인 필요" });
    }

    try{
        const postLikes = await getAllLikesByPostId(postId);
        let isLiked = postLikes.some(tempUserId => tempUserId === userId);

        // 이미 좋아요를 누른경우
        if(isLiked){
            res.status(409).json({ message: "이미 좋아요를 눌렀습니다." });
            return;
        }

        // 좋아요 누르기
        await likePost(postId, userId);
        res.status(200).json({ message: "좋아요 성공" });

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
        const postLikes = await getAllLikesByPostId(postId);
        let isLiked = postLikes.some(tempUserId => tempUserId === userId);

        // 이미 좋아요가 눌러져 있지 않은경우
        if(!isLiked) return;

        // 좋아요 취소
        await unlikePost(postId, userId);
        res.status(200).json({ message: "좋아요 취소 성공" });

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};