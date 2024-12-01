import {createUser, getUserByEmail} from "../models/userModel.js";
import { v4 } from "uuid";
import bcrypt from 'bcrypt';
const saltRounds = 10;

export const signupController = async(req, res) => {
    const {email, password, nickname, profileImage} = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //TODO: 유효성 검사
    //TODO: 이메일 중복 검사 

    const newUser = {
        userId: v4(),
        email: email,
        password: hashedPassword,
        nickname: nickname,
        profileImage: profileImage //TODO: 프로필 이미지 저장하기
    }

    try{
        await createUser(newUser);
        res.status(201).json({
            message: "회원가입 성공"
        });
    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
}

export const loginController = async(req, res) => {

    const {email, password} = req.body;

    //TODO: 유효성 검사
    if(!email || !password){
        // return res.status(401).json({message: "이메일 또는 비밀번호가 잘못되었습니다."});
    }

    try{
        console.log(email);
        const user = await getUserByEmail(email);

        if(!user){
            return res.status(401).json({message: "이메일 또는 비밀번호가 잘못되었습니다."});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            //로그인 실패, 비밀번호가 다름.
            res.status(401).json({message: "이메일 또는 비밀번호가 잘못되었습니다."});
            return;
        }

        //로그인 성공 
        req.session.userId = user.userId; // 세션 객체에 사용자 id 저장
        res.status(200).json({ message: "로그인 성공" });

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
}
