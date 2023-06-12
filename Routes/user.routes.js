const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/user.model");
const { BlacklistModel } = require("../Models/blacklist.model");
const { Authorization } = require("../Middleware/Authorization.middleware");

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await UserModel.findOne({ email });

    if (findUser) {
      res.json({ msg: "User already exist, please login" });
      return;
    } else {
      bcrypt.hash(password, 5, async (err, hash) => {
        if (hash) {
          const user = new UserModel({ ...req.body, password: hash });
          await user.save();
          if (user) {
            res.json({ msg: "User Registered.", user });
          } else {
            res.json({ msg: "Something went wrong please try again." });
          }
        } else {
          res.json({ err: err.message });
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await UserModel.findOne({ email });

    if (findUser) {
      bcrypt.compare(password, findUser.password, async (err, result) => {
        if (result) {
          jwt.sign(
            { userID: findUser._id, userName: findUser.name },
            process.env.secrete,
            { expiresIn: "7d" },
            (err, token) => {
              if (token) {
                res.json({ msg: "User loggedIn.", token });
              } else {
                res.json({ err: err.message });
                return;
              }
            }
          );
        } else {
          res.json({ msg: "Invalid Credentials." });
          return;
        }
      });
    } else {
      res.json({ msg: "User doesnt exist, please register." });
      return;
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

userRouter.post("/logout", Authorization, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { userID, userName } = req.body;
  try {
    const blacklist = await BlacklistModel.findOne({ userID });

    if (blacklist) {
      const updateBlackList = await BlacklistModel.findOneAndUpdate(
        { userID },
        { tokens: [...blacklist.tokens, token] }
      );
      if (updateBlackList) {
        res.json({ msg: "User Loggedout.", blacklist: updateBlackList });
      } else {
        res.json({ msg: "Something went wrong please try again!!" });
      }
    } else {
      const newBlacklist = new BlacklistModel({
        userID,
        userName,
        tokens: [token],
      });
      await newBlacklist.save();
      res.json({ msg: "User Loggedout.", blacklist: newBlacklist });
    }

    console.log(blacklist);
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = { userRouter };
