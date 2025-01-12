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
