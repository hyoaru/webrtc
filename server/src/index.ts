import dotenv from "dotenv";
import { app } from "./instances";
import bodyParser from "body-parser";

export const createApp = () => {
  dotenv.config();

  app.use(bodyParser.json());

  return app;
};
