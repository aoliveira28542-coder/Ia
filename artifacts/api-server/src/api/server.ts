import express from "express";
import { routes } from "./routes";

export function startAPI() {
  const app = express();
  routes(app);

  app.listen(3000, () => {
    console.log("API running on 3000");
  });
}
