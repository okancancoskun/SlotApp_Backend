export type LoginResult = {
  access_token: string;
  user: {
    email: string;
    name: string;
    surname: string;
    coins: number;
  };
};
