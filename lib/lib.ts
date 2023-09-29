import { Request, Response } from "express";
import { auth } from "../lucia.js";

export const getUserSession = async (req: Request, res: Response) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  return session;
};
