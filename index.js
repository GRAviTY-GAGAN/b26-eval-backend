const express = require("express");
const { connection } = require("./db");
require("dotenv").config();
const cors = require("cors");
const { userRouter } = require("./Routes/user.routes");
const { postsRouter } = require("./Routes/posts.routes");

const app = express();
const PORT = process.env.port;

app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/posts", postsRouter);

app.listen(PORT, async () => {
  try {
    await connection;
    console.log(`DB Connected.\nServer running at port ${PORT}.`);
  } catch (error) {
    console.log(error);
  }
});
