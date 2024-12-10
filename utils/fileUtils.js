import fs from "fs";
import path from "path";
import { DefaultProfileImageName } from "../config.js";

export const deleteImage = (filePath) => {
  // const defaultFilePath = path.join(process.cwd(), 'uploads', DefaultProfileImageName);
  // if(filePath === defaultFilePath) return;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("파일 삭제 중 오류 발생:", err);
    } else {
      console.log("파일 삭제 성공:", filePath);
    }
  });
};
