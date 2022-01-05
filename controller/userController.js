const HuxtTechDealABI = require("../contactsABI/ElectionABI.json");
const TextString = require("../config/TextString");
const responseStatus = require("../config/ResponseStatus");
const bcrypt = require("bcrypt");
const conn = require("../config/db_conn");
var Web3 = require("web3");
var Tx = require("ethereumjs-tx").Transaction;
// const web3 = new Web3(
//   new Web3.providers.HttpProvider(
//     "https://data-seed-prebsc-1-s1.binance.org:8545"
//   )
// );

let web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://kovan.infura.io/v3/9e81cde3134f40019b152fafe6d2f265"
  )
);

const signUp = async (req, res, next) => {
  let { userName, password, email, walletAddress, walletKey, userType } =
    req.body;
  const numberCheckingQry = `SELECT * FROM buy_user_info WHERE email LIKE '${email}';`;
  conn.query(numberCheckingQry, (err, result) => {
    if (err) {
      return res.status(501).json({
        msg: "Number checking error",
        error: err.message,
      });
    }

    if (result.length) {
      return res.status(200).json({
        msg: "User already exist",
        error: "This number already exist",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        return res.status(501).json({
          msg: "Password can't bcrypt",
          error: err.message,
        });
      }
      password = hash;
      let signupQry =
        "INSERT INTO buy_user_info (id,userName, email, password, walletAddress, walletKey, userType) VALUES (?);";
      let signupValues = [
        null,
        userName,
        email,
        password,
        walletAddress,
        walletKey,
        userType,
      ];
      conn.query(signupQry, [signupValues], (err, result, fields) => {
        if (err) {
          return res.status(501).json({
            msg: "User info fail to insert in database",
            error: err.message,
          });
        }

        return res.status(200).json({
          msg: "Registration success",
          data: {
            user_id: result.insertId,
          },
        });
      });
    });
  });
};

const login = async (req, res, next) => {
  console.log("req", req.body);
  let { email, password } = req.body;

  const numberCheckingQry = `SELECT * FROM buy_user_info WHERE email LIKE '${email}';`;
  conn.query(numberCheckingQry, (err, result) => {
    console.log("result", result);
    if (err) {
      return res.status(501).json({
        msg: "Number checking error",
        error: err.message,
      });
    }

    if (result.length < 1) {
      return res.status(404).json({
        msg: "User not found",
        error: "User not found",
      });
    } else {
      const user = result[0];
      bcrypt.compare(password, user.password, function (err, result) {
        console.log("result", result);
        console.log("result", err);
        if (result) {
          return res.status(200).json({
            msg: "Login success",
            data: user,
            status: 200,
          });
        } else {
          return res.status(200).send({
            msg: "Login Failed",
            data: null,
            status: 401,
          });
        }
      });
    }
  });
};
module.exports = {
  signUp,
  login,
};
