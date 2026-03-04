export const validateEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePassword = (password: string) => {
  return password.length >= 6;
};

export const normalizeUsername = (value: string) => {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
};

export const validateUsername = (username: string) => {
  return /^[a-z0-9_]{3,30}$/.test(username);
};
