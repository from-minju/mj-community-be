import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';
import { deleteImage, getFilePath } from '../utils/fileUtils.js';

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
        throw error;
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
        throw error;
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
        throw error;
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
        throw error;
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
        throw error;
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
        throw error;
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
        throw error;
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
        throw error;
    }
}