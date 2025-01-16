const TITLE_MAX = 26;
const CONTENT_MAX = 500;
const COMMENT_MAX = 300;

const getLength = (value) => {
  // 줄바꿈 통일
  const normalizedContent = value.trim().replace(/\r\n/g, '\n');
  // 정확한 글자 수 계산
  const characterCount = Array.from(normalizedContent).length;

  return characterCount;
}

export const validateTitle = (titleValue) => {
  if (getLength(titleValue) > TITLE_MAX) {
    console.log("title!!!")
    return false;
  } else {
    return true;
  }
};

export const validatePostContent = (contentValue) => {
  if (getLength(contentValue) > CONTENT_MAX) {
    console.log("content!!!")
    return false;
  } else {
    return true;
  }
};

export const validateComment = (commentValue) => {
  if(getLength(commentValue) > COMMENT_MAX){
      return false;
  }else{
      return true;
  }
}

export const validateEmail = (email) => {
  const emailValue = email.trim();
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailValue) {
    return false;
  }

  if (emailPattern.test(emailValue)) {
    return true;
  } else {
    return false;
  }
}

export const validatePassword = (password) => {
  const passwordValue = password.trim();
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

  if (!passwordValue) {
    return false;
  }

  if (passwordValue && !passwordPattern.test(passwordValue)) {
    return false; //유효하지 않음
  }

  return true; //유효함
}

export const validateNickname = (nickname) => {
    const nicknameValue = nickname.trim();
    const spaceChkPattern = /\s/g;
    const hasSpacesResult = spaceChkPattern.test(nicknameValue);
    if(nicknameValue && 
        nicknameValue.length <= 10 && 
        ! hasSpacesResult){ 
        return true;
    }
    return false;
}