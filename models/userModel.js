import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/dbConfig.js';
import { deleteImage, getFilePath } from '../utils/fileUtils.js';
import { CustomError } from '../utils/customError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const createUser = async (newUser) => {

    const { userId, email, password, nickname, profileImage } = newUser;
    
    try{
        // const newUser = {
        //     userId: v4(),
        //     email: email.trim(),
        //     password: hashedPassword,
        //     nickname: nickname.trim(),
        //     profileImage: profileImage, // 저장된 이미지 경로
        // };

        await pool.query(`
            INSERT INTO user (user_id, email, password, nickname, profile_image)
            VALUES (?, ?, ?, ?, ?)
            `,
            [userId, email, password, nickname, profileImage]
        );

    }catch(error){
        throw new CustomError(500, "사용자 등록 실패");
    }
};


export const getUserById = async (userId) => {
    try{
        const [rows] = await pool.query(`
            SELECT 
                user_id AS userId,
                email,
                password,
                nickname,
                profile_image AS profileImage
            FROM user
            WHERE user_id = ?
            `,
            [userId]
        );

        if (rows.length === 0) {
            throw new Error('해당 ID의 사용자가 존재하지 않습니다.');
        }

        return rows[0];

    } catch(error){
        throw new CustomError(500, "ID로 사용자 조회 실패");
    }
};


export const getUserByEmail = async (email) => {
    try{
        const [rows] = await pool.query(`
            SELECT 
                user_id AS userId,
                email,
                password,
                nickname,
                profile_image AS profileImage
            FROM user
            WHERE email = ?
            `,
            [email]
        );

        if (rows.length === 0) {
            return false;
        }

        return rows[0];
 
    } catch(error){
        throw new CustomError(500, "이메일로 사용자 조회 실패");
    }
};


export const getUserByNickname = async (nickname) => {
    try{
        const [rows] = await pool.query(`
            SELECT 
                user_id AS userId,
                email,
                password,
                nickname,
                profile_image AS profileImage
            FROM user
            WHERE nickname = ?
            `,
            [nickname]
        );

        if (rows.length === 0) {
            return false;
        }

        return rows[0];
 
    } catch(error){
        throw new CustomError(500, "닉네임으로 사용자 조회 실패");
    }
}


export const editProfile = async (userId, editedUserData) => {
    const {nickname, profileImage} = editedUserData
    try{
        await pool.query(`
            UPDATE user
            SET nickname = ?, profile_image = ?
            WHERE user_id = ?
            `,
            [nickname, profileImage, userId]
        );

    } catch(error){
        throw new CustomError(500, "사용자 정보 수정 실패");
    }
};


export const changePassword = async (userId, newPassword) => {
    try{
        await pool.query(`
            UPDATE user
            SET password = ?
            WHERE user_id = ?
            `,
            [newPassword, userId]
        );
        
    }catch(error){
        throw new CustomError(500, "비밀번호 변경 실패");
    }
};


export const getProfileImageNameByUserId = async (userId) => {
    try{
        const [rows] = await pool.query(`
            SELECT 
                profile_image AS profileImage
            FROM user
            WHERE user_id = ?
            `,
            [userId]
        );

        const user = await getUserById(userId);

        if (rows.length === 0) {
            return false;
        }

        return rows[0].profileImage;
        
    }catch(error){
        throw new CustomError(500, "사용자의 프로필사진 이름 조회 실패");
    }
}


export const deleteUserProfileByUserId = async(userId) => {
    try{
        const profileImage = await getProfileImageNameByUserId(userId);

        deleteImage(getFilePath(profileImage));

        await pool.query(`
            DELETE FROM user
            WHERE user_id = ?
            `, 
            [userId]
        );

    }catch(error){
        throw new CustomError(500, "사용자 삭제 실패");
    }
}