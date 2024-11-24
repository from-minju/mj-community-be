import { 
    createPost, getAllPosts, getPostById, editPost, deletePost,
    getCommentsByPostId, createComment,

} from "../models/postModel.js";

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
        const postsData = await getAllPosts();
        res.json({
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

    try{
        const postData = await getPostById(postId);
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
    const { title, content, postImage } = req.body; 

    const newPost = {
        "postId": "",
        "title": title,
        "content": content,
        "postImage": postImage,
        "createdAt": getCurrentDate(), 
        "likes": 0,
        "comments": 0,
        "views": 0,
        "userId": null,
        "nickname": "테스트닉네임", // TODO: session, 사용자 정보는 Controller에서 처리하기. 
        "profileImage": null // TODO:
    }
    
    try{
        const postId = await createPost(newPost);
        res.status(201).json({
            message: "게시물 작성 성공", 
            data: {postId: postId}});

    } catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }

};

// TODO: 게시글 수정
export const editPostController = async(req, res) => {
    const postId = req.params.postId;
    const {title, content, postImage} = req.body;
    
    try{
        const editedPostData = {
            title: title,
            content: content,
            postImage: postImage || null,
        }

        await editPost(postId, editedPostData);
        res.status(200).json({
            message: "게시물 수정 성공",
            data: {postId: postId}
        });

    } catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
    //TODO: 사용자 Id로 프로필사진, 닉네임 가져오기/ posts.json에도 사용자id만 넣어두기.

}


export const deletePostController = async(req, res) => {
    const postId = req.params.postId;

    try{
        await deletePost(postId);
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
    try{
        const postId = req.params.postId;
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
    try{
        const postId = req.params.postId;
        const {content} = req.body;
        const newCommentData = {
            commentId: null,
            userId: 1, //TODO:
            nickname: "테스트닉네임", //TODO:
            profileImage: null, //TODO: 
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
    try{

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }

};

export const deleteCommentController = async(req, res) => {
    try{

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }

};