import multer from "multer";
import path from "path";
import { editProfile, getUserById, changePassword, getAllUsers } from "../models/userModel.js";
import { defaultProfileImage } from "../config.js";

export const getUserProfileController = async (req, res) => {
    try{
        const userId = req.params.userId;
        const user = await getUserById(userId);
        console.log(user);
        res.status(200).json({
            message: "사용자 정보 조회 성공",
            data: {
                email: user.email,
                nickname: user.nickname,
                profileImage: user.profileImage || defaultProfileImage
            }
        });
    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};


export const editProfileController = async(req, res) => {
    try{
        const userId = req.params.userId;
        const editedUserData = req.body;

        await editProfile(userId, editedUserData);

        res.status(200).json({message: "사용자 정보 수정 성공"});

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }

};


export const changePasswordController = async(req, res) => {
    try{
        const userId = req.params.userId;
        const newPassword = req.body.password;

        await changePassword(userId, newPassword);

        res.status(200).json({message: "비밀번호 변경 성공"});

    } catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};


export const checkEmailController = async(req, res) => {
    const {email} = req.body;

    try{
        const users = await getAllUsers();
        const isDuplicate = users.some(user => user.email === email); // some() 배열 순회하며 조건에 맞는 요소가 하나라도 있으면 true 반환

        if(isDuplicate){
            res.status(200).json({ message: "이미 존재하는 이메일입니다.", isDuplicate: isDuplicate });
        }else{
            res.status(200).json({ message: "사용가능한 이메일입니다.", isDuplicate: isDuplicate });
        }
        

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
}

export const checkNicknameController = async(req, res) => {
    const {nickname} = req.body;

    try{
        const users = await getAllUsers();
        const isDuplicate = users.some(user => user.nickname === nickname);

        if(isDuplicate){
            res.status(200).json({ message: "이미 존재하는 닉네임입니다.", isDuplicate: isDuplicate });
        }else{
            res.status(200).json({ message: "사용가능한 닉네임입니다.", isDuplicate: isDuplicate });
        }

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
}

export const uploadProfileImageController = (req, res) => {
    upload.single('profile')

}

