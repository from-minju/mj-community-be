import { getAllPosts } from "../models/postModel.js";

// GET 게시물 목록
export const getPostsController =async(req, res) => {

    const postId = parseInt(req.params.postId);

    try{
        const postsData = await getAllPosts();
        res.json(postsData);
    } catch(error){
        console.log(error); //getAllPosts의 reject()인자 리턴됨
        res.status(500).json({message: "게시물 목록 조회 실패"});
    }
};

// GET 게시물 상세
export const getPostController = async(req, res) => {
    res.json({
        message: "게시물 상세 조회 성공",
        data: {
            postId: postId,
            title: "This is title",
            content: "This is content",
            postImage: "/images/bunny.jpg",
            createdAt: "2024-11-08 02:06:30",
            likes: 123,
            comments: 456,
            views: 500,
            author: "닉네임",
            profileImage: "/images/bunny.jpg"
        }
    });
    
};



// export const createPostController = (req, res) => {

// };

// export const editPostController = (req, res) => {

// };

// export const deletePostController = (req, res) => {

// };