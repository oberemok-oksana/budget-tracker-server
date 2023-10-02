import { Request, Response } from "express";
import { auth } from "../lucia.js";

export const getUserSession = async (req: Request, res: Response) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  return session;
};

export const createNewUser = async () => {
  const user = await auth.createUser({
    key: {
      providerId: "username", // auth method
      providerUserId: "obama".toLowerCase(), // unique id when using "username" auth method
      password: "123456", // hashed by Lucia
    },
    attributes: {
      username: "obama",
    },
  });

  return user;
};
