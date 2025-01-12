// CustomError 클래스 정의
export class CustomError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}