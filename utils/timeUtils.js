export const formatToKoreanTime = (utcTime) => {
    const date = new Date(utcTime); // UTC 시간 생성
    date.setHours(date.getHours() + 9); // 한국 표준시 (KST)로 변환
    return date.toISOString().replace("T", " ").substring(0, 19); // 형식 변경
}

export const getKoreanTime = () => {
    const timestamp = new Date();
    const koreanTime = timestamp.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    // 예: 2025. 1. 7. 오후 3:30:45
    return koreanTime;
}