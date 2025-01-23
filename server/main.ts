import { createApp } from "./src/index";

const app = createApp();

app.listen(8001, () => {
  console.log("Server is running on port 8001");
});
