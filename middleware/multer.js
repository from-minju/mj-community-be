import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsFilePath = path.join(__dirname, '../uploads');

// 저장소 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsFilePath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname); // 고유 파일 이름 생성
        // cb(null, Date.now() + path.extname(file.originalname));
    },
});

// 파일 필터 설정
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const isValidType = allowedTypes.test(file.mimetype);
    if (isValidType) {
        cb(null, true);
    } else {
        cb(new Error('허용되지 않는 파일 형식입니다. (.jpeg, .jpg, and .png만 가능)'));
    }
};

// 파일 크기 제한 (5MB)
const limits = {
    fileSize: 5 * 1024 * 1024,
};


// multer 인스턴스 생성
export const upload = multer({ storage, fileFilter, limits });


