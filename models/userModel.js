import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFilePath = path.join(__dirname, '../data/users.json');

export const getAllUsers = async() => {
    try{
        const data = await fs.readFile(usersFilePath, 'utf-8');
        return JSON.parse(data);
    }catch(error){
        throw error;
    }
};

export const createUser = async (newUser) => {
    try{
        const users = await getAllUsers();

        users.push(newUser);
        
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');

    }catch(error){
        throw error;
    }
};


export const getUserById = async (userId) => {
    try{
        const users = await getAllUsers();
        const user = users.find((user) => user.userId === userId);

        if(!user) throw new Error('해당 ID의 사용자가 존재하지 않습니다.');
        
        return user;

    } catch(error){
        throw error;
    }
};

export const getUserByEmail = async (email) => {
    try{
        const users = await getAllUsers();
        const user = users.find((user) => user.email === email);

        if(!user) throw new Error('해당 email의 사용자가 존재하지 않습니다.');

        return user;
    } catch(error){
        throw error;
    }
};


export const editProfile = async (userId, editedUserData) => {
    try{
        const users = await getAllUsers();
        const userIndex = users.findIndex(user => user.userId === userId);

        if (userIndex === -1) {
            throw new Error('해당 ID의 사용자 정보를 찾을 수 없습니다.');
        }

        users[userIndex] = {
            ...users[userIndex],
            ...editedUserData,
        };

        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8'); 

    } catch(error){
        throw error;
    }
};


export const changePassword = async (userId, newPassword) => {
    try{
        const users = await getAllUsers();
        const userIndex = users.findIndex(user => user.userId === userId);

        users[userIndex] = {
            ...users[userIndex],
            password: newPassword,
        }

        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');

    }catch(error){
        throw error;
    }
};