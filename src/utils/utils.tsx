export const isValidEmail = (email: string): boolean => {
    return email == "" || /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      .test(email.toLowerCase());
};


export const isValidPassword = (password: string): boolean =>{
    return password == "" || (isValidPasswordLength(password) && hasUpperCase(password));
}

const isValidPasswordLength = (password: string): boolean => {
    return password.length >= 6;
}

const hasUpperCase = (password: string): boolean => {
    return password.toLowerCase() != password;
}

export const getEmailError = (email: string): string|null => {
    if (!isValidEmail(email)){
        return "Please enter a valid email.";
    }
    return null;
}

export const getPasswordError = (password: string): string|null =>{
    if (!isValidPasswordLength(password)){
        return "Password must be 6 characters or longer.";
    } else if (!hasUpperCase(password)){
        return "Password must contain at least one uppercase letter.";
    }
    return null;
}