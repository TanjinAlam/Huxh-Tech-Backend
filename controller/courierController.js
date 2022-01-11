const HuxtTechDealABI = require("../contactsABI/ElectionABI.json");
const TextString = require("../config/TextString");
const responseStatus = require("../config/ResponseStatus");
const conn = require("../config/db_conn");

var Web3 = require("web3");
//const ethereum = require('ethereumjs-tx');
var Tx = require("ethereumjs-tx").Transaction;
const { text } = require("body-parser");
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

//requested order from user
const availableOrder = async (req, res, next) => {
  console.log("req", req.body);

  const numberCheckingQry = `SELECT product_order_details.* , deplyed_product.contractAddress ,buy_user_info.walletAddress , seller_product.name,seller_product.price,seller_product.img
      FROM product_order_details
      JOIN seller_product
      ON product_order_details.productId = seller_product.id
      JOIN buy_user_info
      ON product_order_details.userId = buy_user_info.id
      JOIN deplyed_product
      ON product_order_details.deployedId = deplyed_product.id
      WHERE product_order_details.courierId IS NULL AND product_order_details.safePayment = '${1}'`;

  conn.query(numberCheckingQry, (err, result) => {
    if (err) {
      return res.status(200).json({
        msg: TextString.Data_Not_Found,
        status: responseStatus.STATUS_BAD_REQUEST,
      });
    } else if (result.length < 1) {
      return res.status(200).json({
        msg: TextString.Data_Not_Found,
        data: result,
        status: responseStatus.STATUS_NOT_FOUND,
      });
    } else {
      return res.status(200).json({
        msg: TextString.Data_Found,
        data: result,
        status: responseStatus.STATUS_OK,
      });
    }
  });
};

//store the user requested order
const orderRequest = async (req, res, next) => {
  console.log("OREER REQUEST DATE", req.body);
  let { userId, productOrderId } = req.body;
  let query =
    "INSERT INTO courier_request (id,userId, productOrderId , createdAt) VALUES (?);";
  let data = [null, userId, productOrderId, new Date()];
  conn.query(query, [data], (err, result, fields) => {
    if (err) {
      console.log("OREER REQUEST DATE", err);
      return res.status(200).json({
        msg: TextString.Order_Request_Failed,
        status: responseStatus.STATUS_BAD_REQUEST,
      });
    } else {
      return res.status(200).send({
        message: TextString.Order_Request_Success,
        status: responseStatus.STATUS_OK,
      });
    }
  });
};

const processingCourerOrder = async (req, res, next) => {
  let userId = req.body.userId;
  const numberCheckingQry = `SELECT product_order_details.* , deplyed_product.contractAddress ,buy_user_info.walletAddress , seller_product.name,seller_product.price,seller_product.img,courier_request.userId as courierId,courier_request.assigned
      FROM product_order_details
      JOIN seller_product
      ON product_order_details.productId = seller_product.id
      JOIN buy_user_info
      ON product_order_details.userId = buy_user_info.id
      JOIN deplyed_product
      ON product_order_details.deployedId = deplyed_product.id
      JOIN courier_request
      ON product_order_details.courierId = courier_request.id
      WHERE courier_request.userId = '${userId}' and courier_request.assigned IS NOT NULL`;

  conn.query(numberCheckingQry, (err, result) => {
    if (err) {
      return res.status(200).json({
        msg: TextString.Data_Not_Found,
        status: responseStatus.STATUS_BAD_REQUEST,
      });
    } else if (result.length < 1) {
      return res.status(200).json({
        msg: TextString.Data_Not_Found,
        data: result,
        status: responseStatus.STATUS_NOT_FOUND,
      });
    } else {
      return res.status(200).json({
        msg: TextString.Data_Found,
        data: result,
        status: responseStatus.STATUS_OK,
      });
    }
  });
};

//verify photo of the order by seller
const verifyPhotoCourier = async (req, res, next) => {
  console.log("REQ BOY===", req.body);
  //who want to send order their pass and walletaddr
  const walletPRIVKEY = req.body.privateKey;
  const walletAddress = req.body.walletAddress;
  const orderNo = req.body.orderNo;
  const id = req.body.id;
  const ptype = 1;
  // console.log("web3.utils.toWei(value)", web3.utils.toWei(Amount, "wei"));
  // console.log("web3.utils.toWei(value)",web3.utils.toWei(Amount,'gwei'))

  var minABI = HuxtTechDealABI;

  var contractAddress = req.body.contractAddress;
  var contract = new web3.eth.Contract(minABI, contractAddress);
  let buyerAddr = await contract.methods.buyerAddr().call();
  console.log("buyerAddr", buyerAddr);

  const privateKey = Buffer.from(walletPRIVKEY, "hex");
  const deploy = async () => {
    try {
      const txCount = await web3.eth.getTransactionCount(walletAddress);

      console.log("ASdasdas", txCount);

      const txObject = {
        nonce: web3.utils.toHex(txCount),
        from: walletAddress,
        gasLimit: web3.utils.toHex(4700000), // Raise the gas limit to a much higher amount
        gasPrice: web3.utils.toHex(web3.utils.toWei("15", "gwei")),
        value: web3.utils.toHex(web3.utils.toWei(Amount, "wei")),
        to: contractAddress,
        data: contract.methods
          .SendPhotoVerification(orderNo, ptype)
          .encodeABI(),
      };
      // kovin 42, rinyby 4
      const tx = new Tx(txObject, { chain: 42 });
      tx.sign(privateKey);

      const serializedTx = tx.serialize();
      const raw = "0x" + serializedTx.toString("hex");
      await web3.eth.sendSignedTransaction(raw).then(function (OrderSent) {
        trxHash = OrderSent.transactionHash;
        contract.getPastEvents(
          "PhotoVerified",
          {
            filter: { transactionHash: [trxHash] },
          },
          function (error, result) {
            if (!error) {
              let productUpdateQuery = `UPDATE product_order_details SET photoVerifiedBySeller ="${1}" WHERE id = '${id}'`;
              conn.query(productUpdateQuery, async (err, result) => {
                console.log("ERROR++++++++++", result);
                if (err) {
                  return res.status(200).json({
                    msg: TextString.Photo_Verified_Failed,
                    data: null,
                    status: responseStatus.STATUS_NOT_FOUND,
                  });
                }
              });
              return res.status(200).json({
                msg: TextString.Photo_Verified_Successful,
                data: null,
                status: responseStatus.STATUS_OK,
              });
            } else {
              return res.status(200).json({
                msg: TextString.Photo_Verified_Failed,
                data: null,
                status: responseStatus.STATUS_NOT_FOUND,
              });
            }
          }
        );
      });
    } catch (error) {
      console.log("EOR", error);
      return res.status(200).json({
        msg: TextString.Photo_Verified_Failed,
        data: null,
        status: responseStatus.STATUS_NOT_FOUND,
      });
    }
  };
  deploy();
};

//delivery order to the user call the delivery function
const deliveryOrder = async (req, res, next) => {
  console.log("REQ BOY===", req.body);
  let output = { status: null, data: null, msg: null };
  //who want to send order their pass and walletaddr
  const walletPRIVKEY = req.body.privateKey;
  const walletAddress = req.body.walletAddress;
  const invoiceNo = req.body.walletAddress;

  let trxHash;
  var id = req.body.id;

  let date = new Date();
  console.log("date", date);
  const UnixDate = new Date(date).getTime() / 1000;

  console.log("VIDEO", videoURL);

  var minABI = HuxtTechDealABI;

  var contractAddress = req.body.contractAddress;
  var contract = new web3.eth.Contract(minABI, contractAddress);
  let buyerAddr = await contract.methods.buyerAddr().call();
  console.log("buyerAddr", buyerAddr);

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
        data: contract.methods.sendOrder(invoiceNo, UnixDate).encodeABI(),
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
            "OrderDelivered",
            {
              filter: { transactionHash: [trxHash] },
            },
            function (error, result) {
              if (!error) {
                console.log("result", result);
                let orderSendDate = result[0].returnValues["timestamp"];
                let productUpdateQuery = `UPDATE product_order_details SET orderSendDate ="${orderSendDate}", deliveryDone = "${1}" WHERE id = '${id}'`;
                conn.query(productUpdateQuery, async (err, result) => {
                  if (err) {
                    return res.status(200).json({
                      msg: TextString.Order_Delivery_Failed,
                      data: null,
                      status: responseStatus.STATUS_NOT_FOUND,
                    });
                  }
                });

                return res.status(200).json({
                  msg: TextString.Order_Delivery_Successfull,
                  data: null,
                  status: responseStatus.STATUS_OK,
                });
              } else {
                return res.status(200).json({
                  msg: TextString.Order_Delivery_Failed,
                  data: null,
                  status: responseStatus.STATUS_NOT_FOUND,
                });
              }
            }
          );
        });
    } catch (error) {
      console.log("ERROR", error);
      return res.status(200).json({
        msg: TextString.Order_Delivery_Failed,
        data: null,
        status: responseStatus.STATUS_NOT_FOUND,
      });
    }
  };
  deploy();
};

module.exports = {
  signUp,
  login,
  availableOrder,
  orderRequest,
  processingCourerOrder,
  verifyPhotoCourier,
  deliveryOrder,
};
