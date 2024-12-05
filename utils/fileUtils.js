import fs from 'fs';
import path from 'path';

export const deleteImage = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
          console.error('파일 삭제 중 오류 발생:', err);
        } else {
          console.log('파일 삭제 성공:', filePath);
        }
    });
};

// export const getFullImagePath = (imageName) => {
//     return path.join(process.cwd(), uploads, imageName);
// };