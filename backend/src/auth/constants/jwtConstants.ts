export const jwtConstants = {
  secret: {
    login: process.env.SECRET_KEY,
    resetPass: process.env.SECRET_KEY_RESET,
  },
  expiresIn: {
    login: process.env.EXPIRES_IN,
    resetPass: process.env.EXPIRES_IN_RESET,
  },
};
