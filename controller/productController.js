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

const insertProduct = async (req, res, next) => {
  let { name, price, img, userId } = req.body;
  let signupQry =
    "INSERT INTO seller_product (id,name, price, img, userId) VALUES (?);";
  let productValue = [null, name, price, img, userId];
  conn.query(signupQry, [productValue], (err, result, fields) => {
    if (err) {
      return res.status(200).json({
        msg: TextString.Data_Insert_Failed,
        status: responseStatus.STATUS_BAD_REQUEST,
      });
    }

    return res.status(200).json({
      msg: TextString.Data_Insert_Success,
      status: responseStatus.STATUS_OK,
    });
  });
};

const productList = async (req, res, next) => {
  console.log("req", req.body);
  let { userId } = req.body;

  const numberCheckingQry = `SELECT * FROM seller_product WHERE userId LIKE '${userId}';`;
  conn.query(numberCheckingQry, (err, result) => {
    console.log("result", result);
    if (err) {
      return res.status(200).json({
        msg: TextString.Data_Insert_Failed,
        statis: responseStatus.STATUS_BAD_REQUEST,
      });
    }

    if (result.length < 1) {
    } else {
      return res.status(200).json({
        msg: TextString.Data_Insert_Success,
        data : result,
        statis: responseStatus.STATUS_OK,
      });
    }
  });
};

module.exports = {
  insertProduct,
  productList,
};
