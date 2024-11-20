import { getAllPosts, getPostById } from "../models/postModel.js";

// GET 게시물 목록
export const getPostsController =async(req, res) => {
    const postId = parseInt(req.params.postId);

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
    const postId = parseInt(req.params.postId);

    try{
        const postData = await getPostById(postId);
        res.json({
            message: "게시물 상세 조회 성공",
            data: postData
        });

    }catch(error){
        console.log(error); // getPostById의 throw() 인자 리턴됨
        res.status(404).json({message: "게시물 상세 조회 실패"});
    } 
};