import bcrypt from 'bcrypt';
import path from "path";
import { editProfile, getUserById, changePassword, getProfileImageNameByUserId, deleteUserProfileByUserId, getUserByNickname, getUserByEmail } from "../models/userModel.js";
import { DefaultProfileImageName } from "../config.js";
import { deleteImage } from "../utils/fileUtils.js";
import { deleteCommentsByUserId, deleteLikesByUserId, deletePostsByUserId } from "../models/postModel.js";
import { validateNickname, validatePassword } from '../utils/validation.js';
const saltRounds = 10;

export const getUserProfileController = async (req, res, next) => {
    try{
        const userId = req.params.userId;
        const user = await getUserById(userId);

        res.status(200).json({
            message: "사용자 정보 조회 성공",
            data: {
                email: user.email,
                nickname: user.nickname,
                profileImage: user.profileImage || DefaultProfileImageName
            }
        });
    }catch(error){
        next(error);
    }
};


export const editProfileController = async(req, res, next) => {
    const userId = req.session.userId;
    const { isProfileImageChanged, nickname } = req.body;

    if(!validateNickname(nickname)){
        return res.status(400).json({ message: "유효하지 않은 요청입니다." });
    }

    try{
        const previousImageName = await getProfileImageNameByUserId(userId);
        let profileImageName = previousImageName;

        // 프로필 이미지에 변경이 있었다면,
        if(isProfileImageChanged === 'true'){
            profileImageName = req.file ? req.file.filename : DefaultProfileImageName;

            // 기존 프로필 이미지 삭제
            if(previousImageName !== DefaultProfileImageName){
                const filePath = path.join(process.cwd(), 'uploads', previousImageName);
                deleteImage(filePath);
            }
        }

        const editedUserData = {
            nickname: req.body.nickname,
            profileImage: profileImageName
        }

        await editProfile(userId, editedUserData);

        res.status(200).json({message: "사용자 정보 수정 성공"});

    }catch(error){
        next(error);
    }

};


export const changePasswordController = async(req, res, next) => {
    const userId = req.session.userId;
    const newPassword = req.body.password;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    if(!validatePassword(newPassword)){
        return res.status(400).json({ message: "유효하지 않은 요청입니다." });
    }

    try{
        const user = await getUserById(userId);
        const isPasswordSame = await bcrypt.compare(newPassword, user.password);
        
        if(isPasswordSame){
            res.status(400).json({message: "새 비밀번호는 기존 비밀번호와 같을 수 없습니다. 다시 입력해주세요."});
            return;
        }

        await changePassword(userId, hashedNewPassword);

        res.status(200).json({message: "비밀번호 변경 성공"});

    } catch(error){
        next(error);
    }
};


export const checkEmailController = async(req, res, next) => {
    const { email } = req.body;

    try{
        const user = await getUserByEmail(email);
        const isDuplicate = !!user;

        if(isDuplicate){
            res.status(200).json({ message: "이미 존재하는 이메일입니다.", isDuplicate: isDuplicate });
        }else{
            res.status(200).json({ message: "사용가능한 이메일입니다.", isDuplicate: isDuplicate });
        }

    }catch(error){
        next(error);
    }
}

export const checkNicknameController = async(req, res, next) => {
    const {nickname} = req.body;

    try{
        const user = await getUserByNickname(nickname);
        let isDuplicate = !!user

        // 닉네임에 변경이 없다면, 중복되지 않았다고 처리함. 
        if(req.session.userId){
            const userId = req.session.userId;
            const user = await getUserById(userId);
            if(user.nickname === nickname){
                isDuplicate = false;
            }
        }
        
        // 응답
        res.status(200).json({
          message: isDuplicate
            ? "이미 존재하는 닉네임입니다."
            : "사용 가능한 닉네임입니다.",
          isDuplicate,
        });

    }catch(error){
        next(error);
    }
}

export const deleteAccountController = async(req, res, next) => {
    const userId = req.session.userId;

    try{
        // 좋아요 삭제
        await deleteLikesByUserId(userId);

        // 댓글 삭제
        await deleteCommentsByUserId(userId);

        // 게시물 삭제
        await deletePostsByUserId(userId);

        // 사용자 정보 삭제 (프로필 사진까지)
        await deleteUserProfileByUserId(userId);

        // 로그아웃(세션 쿠키 제거)
        req.session.destroy((error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "서버 에러 발생" });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: "회원탈퇴 성공" });
        });

    } catch(error){
        next(error);
    }
}

