import bcrypt from 'bcrypt';
import { v4 } from "uuid";
import {createUser, getUserByEmail, getUserById} from "../models/userModel.js";
import { upload } from "../middleware/multer.js";
import { defaultProfileImageName } from '../config.js';
const saltRounds = 10;


export const checkAuthenticationController = async(req, res) => {
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
                profileImage: user.profileImage || defaultProfileImageName
            }
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({message: "서버 에러 발생"});
    }
}

export const logoutController = async(req, res) => {
    req.session.destroy((error) => {
        if(error){
            return res.status(500).json({ message: '서버 에러 발생' });
        }
        res.clearCookie('connect.sid'); // 세션 쿠키 제거
        res.status(200).json({ message: '로그아웃 성공' });
    })
}


export const signupController = async(req, res) => {

    const { email, password, nickname } = req.body;
    const profileImage = req.file ? `${req.file.filename}` : defaultProfileImageName; // 업로드된 파일 경로
    const hashedPassword = await bcrypt.hash(password, saltRounds); // 비밀번호 암호화

    // TODO: 유효성 검사 추가
    // TODO: 이메일 중복 검사

    const newUser = {
        userId: v4(),
        email: email.trim(),
        password: hashedPassword,
        nickname: nickname.trim(),
        profileImage: profileImage, // 저장된 이미지 경로
    };

    try {
        await createUser(newUser); // 데이터베이스에 사용자 추가
        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 에러 발생'});
    }

    // upload.single('profileImage')(req, res, async (err) => {
        
    // })
}

export const loginController = async(req, res) => {

    const {email, password} = req.body;

    //TODO: 유효성 검사
    if(!email || !password){
        // return res.status(401).json({message: "이메일 또는 비밀번호가 잘못되었습니다."});
    }

    try{
        const user = await getUserByEmail(email);
        // 로그인 실패. 이메일 다름.
        if(!user){
            return res.status(401).json({message: "이메일 또는 비밀번호가 잘못되었습니다."});
        }

        // 로그인 실패. 비밀번호가 다름.
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({message: "이메일 또는 비밀번호가 잘못되었습니다."});
        }

        //로그인 성공 
        req.session.userId = user.userId; // 세션에 사용자 id 저장
        res.status(200).json({ message: "로그인 성공" });

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
}
