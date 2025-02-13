import bcrypt from 'bcryptjs';
import { v4 as uuidV4 } from "uuid";
import {createUser, getUserByEmail, getUserById, getUserByNickname} from "../models/userModel.js";
import { validateEmail, validateNickname, validatePassword } from '../utils/validation.js';
const saltRounds = 10;


export const checkAuthenticationController = async(req, res, next) => {

    if(!req.session.userId){
        return res.status(401).json({message: "로그인이 필요합니다."});
    }

    try{
        const user = await getUserById(req.session.userId);

        if(!user){
            return res.status(404).json({message: "존재하지 않는 사용자입니다."});
        }

        res.status(200).json({
            message: "사용자 조회 성공",
            data: {
                userId: user.userId,
                email: user.email,
                nickname: user.nickname,
                profileImage: user.profileImage
            }
        });
    }catch(error){
        next(error);
    }
}

export const logoutController = async(req, res, next) => {
    req.session.destroy((error) => {
        if(error){
            return res.status(500).json({ message: '서버 에러 발생' });
        }
        res.clearCookie('connect.sid'); // 세션 쿠키 제거
        res.status(200).json({ message: '로그아웃 성공' });
    })
}


export const signupController = async(req, res, next) => {

    const { email, password, nickname, profileImage } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds); // 비밀번호 암호화

    if(!validateEmail(email) || !validatePassword(password) || !validateNickname(nickname)){
        return res.status(400).json({ message: '유효하지 않은 요청입니다.'});
    }

    const newUser = {
        userId: uuidV4(),
        email: email.trim(),
        password: hashedPassword,
        nickname: nickname.trim(),
        profileImage: profileImage, 
    };

    try {

        const isDuplicatedEmail = !!(await getUserByEmail(email));
        if(isDuplicatedEmail){
            return res.status(409).json({ message: '이미 존재하는 이메일입니다.'});
        }

        const isDuplicatedNickname = !!(await getUserByNickname(nickname));
        if(isDuplicatedNickname){
            return res.status(409).json({ message: '이미 존재하는 닉네임입니다.'});
        }

        await createUser(newUser); 
        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        next(error);
    }

}

export const loginController = async(req, res, next) => {

    const {email, password} = req.body;

    if(!email || !password || !validateEmail(email) || !validatePassword(password)){
        return res.status(400).json({ message: '유효하지 않은 요청입니다.'});
    }

    try{
        const user = await getUserByEmail(email);
        // 로그인 실패. 이메일 다름.
        if(!user){
            return res.status(401).json({message: "존재하지 않는 사용자입니다."});
        }

        // 로그인 실패. 비밀번호가 다름.
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({message: "비밀번호가 잘못되었습니다."});
        }

        //로그인 성공 
        req.session.userId = user.userId; // 세션에 사용자 id 저장
        res.status(200).json({ message: "로그인 성공" });

    }catch(error){
        next(error);
    }
}
