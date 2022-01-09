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
        status: responseStatus.STATUS_BAD_GATEWAY,
      });
    }

    if (result.length) {
      return res.status(200).json({
        msg: "User already exist",
        status: responseStatus.CONFLECT_ERROR,
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
            status: responseStatus.STATUS_BAD_GATEWAY,
          });
        }

        return res.status(200).json({
          msg: "Registration success",
          data: {
            user_id: result.insertId,
          },
          status: responseStatus.STATUS_OK,
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
        status: responseStatus.STATUS_BAD_GATEWAY,
      });
    }

    if (result.length < 1) {
      return res.status(404).json({
        msg: "User not found",
        status: responseStatus.STATUS_NOT_FOUND,
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
            status: responseStatus.STATUS_OK,
          });
        } else {
          return res.status(200).send({
            msg: "Incorrect Passowrd",
            data: null,
            status: responseStatus.STATUS_UNAUTHORIZED,
          });
        }
      });
    }
  });
};

const availableProduct = async (req, res, next) => {
  console.log("req", req.body);

  const numberCheckingQry = `SELECT seller_product.* , deplyed_product.contractAddress, deplyed_product.id as deployedId
  FROM seller_product
  JOIN deplyed_product
  ON seller_product.id = deplyed_product.productId
  WHERE seller_product.status = '${1}'`;

  conn.query(numberCheckingQry, (err, result) => {
    if (err) {
      return res.status(200).json({
        msg: TextString.Data_Not_Found,
        statis: responseStatus.STATUS_BAD_REQUEST,
      });
    } else if (result.length < 1) {
      return res.status(200).json({
        msg: TextString.Data_Not_Found,
        data: result,
        statis: responseStatus.STATUS_NOT_FOUND,
      });
    } else {
      return res.status(200).json({
        msg: TextString.Data_Found,
        data: result,
        statis: responseStatus.STATUS_OK,
      });
    }
  });
};

const orderRequest = async (req, res, next) => {
  console.log("OREER REQUEST DATE", req.body);
  let { userId, productId, quantity } = req.body;
  let query =
    "INSERT INTO product_order_details (id,userId, productId, quantity, createdAt) VALUES (?);";
  let data = [null, userId, productId, quantity, new Date()];
  conn.query(query, [data], (err, result, fields) => {
    if (err) {
      console.log("OREER REQUEST DATE", err);
      return res.status(200).json({
        msg: TextString.Order_Request_Failed,
        status: responseStatus.STATUS_BAD_REQUEST,
      });
    } else {
      let productUpdateQuery = `UPDATE seller_product SET status ="${2}" WHERE id = '${productId}'`;
      conn.query(productUpdateQuery, async (err, result) => {
        if (err) {
          return res.status(200).send({
            msg: TextString.Order_Request_Failed,
            status: responseStatus.STATUS_BAD_GATEWAY,
          });
        } else {
          return res.status(200).send({
            message: TextString.Order_Request_Success,
            status: responseStatus.STATUS_OK,
          });
        }
      });
    }
  });
};

const sendOrder = (req, res, next) => {
  console.log("REQ BOY===", req.body);
  let output = { status: null, data: null, msg: null };
  //who want to send order their pass and walletaddr
  const walletPRIVKEY = req.body.privateKey;
  const walletAddress = req.body.walletAddress;

  let trxHash;
  let goods = req.body.goods;
  var quantity = req.body.quantity;
  var photoURL = req.body.photoURL;
  var id = req.body.id;

  var videoURL = req.body.videoURL ? req.body.videoURL : "";

  console.log("VIDEO", videoURL);

  var minABI = HuxtTechDealABI;

  var contractAddress = req.body.contractAddress;
  var contract = new web3.eth.Contract(minABI, contractAddress);
  const privateKey = Buffer.from(walletPRIVKEY, "hex");
  const deploy = async () => {
    try {
      const txCount = await web3.eth.getTransactionCount(walletAddress);

      console.log("ASdasdas", txCount);

      const txObject = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(4700000), // Raise the gas limit to a much higher amount
        gasPrice: web3.utils.toHex(web3.utils.toWei("15", "gwei")),
        to: contractAddress,
        data: contract.methods
          .sendOrder(goods, quantity, photoURL, videoURL)
          .encodeABI(),
      };
      // kovin 42, rinyby 4
      const tx = new Tx(txObject, { chain: 42 });
      tx.sign(privateKey);

      const serializedTx = tx.serialize();
      const raw = "0x" + serializedTx.toString("hex");
      await web3.eth
        .sendSignedTransaction(raw)
        .on("OrderSent", function (error, event) {
          console.log("error", error);
          console.log(event);
        })
        .then(function (OrderSent) {
          trxHash = OrderSent.transactionHash;
          contract.getPastEvents(
            "OrderSent",
            {
              filter: { transactionHash: [trxHash] },
            },
            function (error, result) {
              if (!error) {
                console.log("result", result);
                let orderNo = result[0].returnValues["orderno"]
                let productUpdateQuery = `UPDATE product_order_details SET orderNo ="${orderNo}" WHERE id = '${id}'`;
                conn.query(productUpdateQuery, async (err, result) => {
                  if (err) {
                    return res.status(200).json({
                      msg: TextString.Order_Failed,
                      data: null,
                      statis: responseStatus.STATUS_NOT_FOUND,
                    });
                  }
                });

                return res.status(200).json({
                  msg: TextString.Order_Success,
                  data: null,
                  statis: responseStatus.STATUS_OK,
                });
              } else {
                return res.status(200).json({
                  msg: TextString.Order_Failed,
                  data: null,
                  statis: responseStatus.STATUS_NOT_FOUND,
                });
              }
            }
          );
        });
    
    } catch (error) {
      console.log("ERROR", error);
      res.json({ error: true, data: { message: error.message } });
    }
  };
  deploy();
};

const acceptedOrder = async (req, res, next) => {
  console.log("req", req.body);
  let { userId } = req.body;

  const numberCheckingQry = `SELECT product_order_details.* , seller_product.status , seller_product.name, seller_product.price, seller_product.img,deplyed_product.contractAddress
  FROM product_order_details
  JOIN seller_product
  ON product_order_details.productId = seller_product.id
  JOIN deplyed_product
  ON product_order_details.deployedId = deplyed_product.id
  WHERE product_order_details.userId = '${userId}' AND seller_product.status = '${3}'`;

  conn.query(numberCheckingQry, (err, result) => {
    if (err) {
      return res.status(200).json({
        msg: TextString.Data_Not_Found,
        statis: responseStatus.STATUS_BAD_REQUEST,
      });
    } else if (result.length < 1) {
      return res.status(200).json({
        msg: TextString.Data_Not_Found,
        data: result,
        statis: responseStatus.STATUS_NOT_FOUND,
      });
    } else {
      return res.status(200).json({
        msg: TextString.Data_Found,
        data: result,
        statis: responseStatus.STATUS_OK,
      });
    }
  });
};

module.exports = {
  signUp,
  login,
  availableProduct,
  acceptedOrder,
  orderRequest,
  sendOrder,
};
