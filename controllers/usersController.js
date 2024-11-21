import { editProfile, getUserById } from "../models/userModel.js";

export const getUserProfileController = async (req, res) => {
    try{
        const userId = parseInt(req.params.userId);
        const user = await getUserById(userId);
        console.log(user);
        res.status(200).json({
            message: "사용자 정보 조회 성공",
            data: {
                email: user.email,
                nickname: user.nickname,
                profileImage: user.profileImage
            }
        });
    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
    
};


export const editProfileController = async(req, res) => {
    try{
        const userId = parseInt(req.params.userId);
        const editedUserData = req.body;

        await editProfile(userId, editedUserData);

        res.status(200).json({message: "사용자 정보 수정 성공"});

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }

};


export const changePasswordController = () => {

};