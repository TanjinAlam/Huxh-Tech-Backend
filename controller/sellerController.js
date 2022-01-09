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

//requested order from user
const requestedOrder = async (req, res, next) => {
  console.log("req", req.body);

  const numberCheckingQry = `SELECT product_order_details.* , deplyed_product.contractAddress ,buy_user_info.walletAddress , seller_product.name,seller_product.price,seller_product.img
    FROM product_order_details
    JOIN seller_product
    ON product_order_details.productId = seller_product.id
    JOIN buy_user_info
    ON product_order_details.userId = buy_user_info.id
    JOIN deplyed_product
    ON product_order_details.deployedId = deplyed_product.id
    WHERE seller_product.status = '${2}'`;

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

//accept requested order of user
const accpetOrder = (req, res, next) => {
  console.log("REQ BOY===", req.body);
  let output = { status: null, data: null, msg: null };
  //who want to send order their pass and walletaddr
  const walletPRIVKEY = req.body.privateKey;
  const walletAddress = req.body.walletAddress;
  const productId = req.body.productId;

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
        data: contract.methods.updateBuyer(walletAddress).encodeABI(),
      };
      // kovin 42, rinyby 4
      const tx = new Tx(txObject, { chain: 42 });
      tx.sign(privateKey);

      const serializedTx = tx.serialize();
      const raw = "0x" + serializedTx.toString("hex");
      await web3.eth
        .sendSignedTransaction(raw)
        .then(function (result) {
          console.log("OrderSent", result);
          let productUpdateQuery = `UPDATE seller_product SET status ="${3}" WHERE id = '${productId}'`;
          conn.query(productUpdateQuery, async (err, result) => {
            if (err) {
              return res.status(200).json({
                msg: TextString.Order_Accepted_Failed,
                data: null,
                statis: responseStatus.STATUS_NOT_FOUND,
              });
            }
          });

          return res.status(200).json({
            msg: TextString.Order_Accepted,
            data: null,
            statis: responseStatus.STATUS_OK,
          });
        })
        .catch((err) => {
          return res.status(200).json({
            msg: TextString.Order_Accepted_Failed,
            data: null,
            statis: responseStatus.STATUS_NOT_FOUND,
          });
        });
    } catch (error) {
      console.log("ERROR", error);
      return res.status(200).json({
        msg: TextString.Order_Accepted_Failed,
        data: null,
        statis: responseStatus.STATUS_NOT_FOUND,
      });
    }
  };
  deploy();
};

//sendorder 
const processingOrder = async (req, res, next) => {
  console.log("req", req.body);

  const numberCheckingQry = `SELECT product_order_details.* , deplyed_product.contractAddress ,buy_user_info.walletAddress , seller_product.name,seller_product.price,seller_product.img
      FROM product_order_details
      JOIN seller_product
      ON product_order_details.productId = seller_product.id
      JOIN buy_user_info
      ON product_order_details.userId = buy_user_info.id
      JOIN deplyed_product
      ON product_order_details.deployedId = deplyed_product.id
      WHERE seller_product.status = '${3}' AND product_order_details.orderNo  IS NOT NULL`;

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

const sendOrder = (req, res, next) => {
  console.log("REQ BOY===", req.body);
  let output = { status: null, data: null, msg: null };
  //who want to send order their pass and walletaddr
  const walletPRIVKEY = req.body.buyerPrivateKey;
  const walletAddress = req.body.buyerAddress;

  let trxHash;
  let goods = req.body.goods;
  var quantity = req.body.quantity;
  var photoURL = req.body.photoURL;
  var videoURL = req.body.videoURL;

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
                output.data = result;
                output.msg = TextString.Order_Success;
                output.status = responseStatus.STATUS_OK;
              } else {
                output.data = error;
                output.msg = TextString.Order_Failed;
                output.status = responseStatus.STATUS_NOT_FOUND;
              }
            }
          );
        });

      // res.json({
      //   error: false,
      //   data: {
      //     message: "Token Send Successfully",
      //     txId: output,
      //   },
      // });
    } catch (error) {
      console.log("ERROR", error);
      res.json({ error: true, data: { message: error.message } });
    }
  };
  deploy();
};

const setProductPrice = (req, res, next) => {
  console.log("REQ BOY===", req.body);
  //who want to send order their pass and walletaddr
  const walletPRIVKEY = req.body.privateKey;
  const walletAddress = req.body.walletAddress;

  const orderNo = req.body.orderNo;
  const price = req.body.price;
  const id = req.body.id;
  const ttype = 1;

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
        data: contract.methods.sendPrice(orderNo, price, ttype).encodeABI(),
      };
      // kovin 42, rinyby 4
      const tx = new Tx(txObject, { chain: 42 });
      tx.sign(privateKey);

      const serializedTx = tx.serialize();
      const raw = "0x" + serializedTx.toString("hex");
      await web3.eth
        .sendSignedTransaction(raw)
        .then(function (result) {
          console.log("result",result)
          trxHash = result.transactionHash;
          contract.getPastEvents(
            "PriceSent",
            {
              filter: { transactionHash: [trxHash] },
            },
            function (error, output) {
              if (!error) {
                console.log("result", output);
                let getPrice = output[0].returnValues["price"];
                let productUpdateQuery = `UPDATE product_order_details SET productPrice ="${getPrice}" WHERE id = '${id}'`;
                conn.query(productUpdateQuery, async (err, result) => {
                  if (err) {
                    return res.status(200).json({
                      msg: TextString.Price_Insert_Failed,
                      data: null,
                      statis: responseStatus.STATUS_NOT_FOUND,
                    });
                  }
                });

                return res.status(200).json({
                  msg: TextString.Price_Inserted,
                  data: null,
                  statis: responseStatus.STATUS_OK,
                });
              } else {
                return res.status(200).json({
                  msg: TextString.Price_Insert_Failed,
                  data: null,
                  statis: responseStatus.STATUS_NOT_FOUND,
                });
              }
            }
          );
        })
        .catch((err) => {
          console.log("ERROR",err)
          return res.status(200).json({
            msg: TextString.Price_Insert_Failed,
            data: null,
            statis: responseStatus.STATUS_NOT_FOUND,
          });
        });
    } catch (error) {
      console.log("ERROR", error);
      return res.status(200).json({
        msg: TextString.Price_Insert_Failed,
        data: null,
        statis: responseStatus.STATUS_NOT_FOUND,
      });
    }
  };
  deploy();
};


const setShipmentPrice = (req, res, next) => {
  console.log("REQ BOY===", req.body);
  //who want to send order their pass and walletaddr
  const walletPRIVKEY = req.body.privateKey;
  const walletAddress = req.body.walletAddress;

  const orderNo = req.body.orderNo;
  const price = req.body.price;
  const id = req.body.id;
  const ttype = 2;

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
        data: contract.methods.sendPrice(orderNo, price, ttype).encodeABI(),
      };
      // kovin 42, rinyby 4
      const tx = new Tx(txObject, { chain: 42 });
      tx.sign(privateKey);

      const serializedTx = tx.serialize();
      const raw = "0x" + serializedTx.toString("hex");
      await web3.eth
        .sendSignedTransaction(raw)
        .then(function (result) {
          console.log("result",result)
          trxHash = result.transactionHash;
          contract.getPastEvents(
            "PriceSent",
            {
              filter: { transactionHash: [trxHash] },
            },
            function (error, output) {
              if (!error) {
                console.log("result", output);
                let getPrice = output[0].returnValues["price"];
                let productUpdateQuery = `UPDATE product_order_details SET shipmentPrice ="${getPrice}" WHERE id = '${id}'`;
                conn.query(productUpdateQuery, async (err, result) => {
                  if (err) {
                    return res.status(200).json({
                      msg: TextString.Price_Insert_Failed,
                      data: null,
                      statis: responseStatus.STATUS_NOT_FOUND,
                    });
                  }
                });
              

                return res.status(200).json({
                  msg: TextString.Price_Inserted,
                  data: null,
                  statis: responseStatus.STATUS_OK,
                });
              } else {
                return res.status(200).json({
                  msg: TextString.Price_Insert_Failed,
                  data: null,
                  statis: responseStatus.STATUS_NOT_FOUND,
                });
              }
            }
          );
        })
        .catch((err) => {
          console.log("ERROR",err)
          return res.status(200).json({
            msg: TextString.Price_Insert_Failed,
            data: null,
            statis: responseStatus.STATUS_NOT_FOUND,
          });
        });
    } catch (error) {
      console.log("ERROR", error);
      return res.status(200).json({
        msg: TextString.Price_Insert_Failed,
        data: null,
        statis: responseStatus.STATUS_NOT_FOUND,
      });
    }
  };
  deploy();
};

module.exports = {
  requestedOrder,
  accpetOrder,
  processingOrder,
  setProductPrice,
  setShipmentPrice,
};
