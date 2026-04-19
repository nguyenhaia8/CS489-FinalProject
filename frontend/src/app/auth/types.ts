export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  data: {
    userId: string;
    username: string;
    email: string;
  };
}

export interface SigninResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      userId: string;
      username: string;
      email: string;
      role: string;
      theme: string;
      language: string;
    };
  };
}

export interface AppState {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    username: string;
    email: string;
    role: string;
    theme: string;
    language: string;
  };
}

export const InitState = {
  accessToken: '',
  refreshToken: '',
  user: {
    userId: '',
    username: '',
    email: '',
    role: '',
    theme: 'light',
    language: 'en',
  },
};
