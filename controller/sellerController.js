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
  const buyerAddress = req.body.buyerAddress;
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
        data: contract.methods.updateBuyer(buyerAddress).encodeABI(),
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
            console.log("ERROR", err);
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
          console.log("ERROR", err);
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
  console.log("HERE=============");
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
          console.log("result", result);
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
          console.log("ERROR", err);
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
          console.log("result", result);
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
                console.log("getPrice", getPrice);
                let productUpdateQuery = `UPDATE product_order_details SET shipmentPrice ="${getPrice}" WHERE id = '${id}'`;
                conn.query(productUpdateQuery, async (err, result) => {
                  console.log("ERROR==========", err);
                  console.log("ERROR++++++++++", result);
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
          console.log("ERROR", err);
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

//requested order from user
const courierRequest = async (req, res, next) => {
  console.log("req", req.body);

  const numberCheckingQry = `SELECT courier_request.* , buy_user_info.walletAddress, buy_user_info.walletKey, buy_user_info.userName,product_order_details.id as productOrderDetailsId,product_order_details.productId,seller_product.price,seller_product.img,seller_product.name,deplyed_product.id as deployedProductId,deplyed_product.contractAddress
    FROM courier_request
    JOIN buy_user_info
    ON courier_request.userId = buy_user_info.id
    JOIN product_order_details
    ON courier_request.productOrderId = product_order_details.id
    JOIN seller_product
    ON product_order_details.productId = seller_product.id
    JOIN deplyed_product
    ON product_order_details.deployedId = deplyed_product.id
    WHERE courier_request.assigned IS NULL`;

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

//accept requested order of user its calling sendInvoice function
const acceptCourierRequest = async (req, res, next) => {
  console.log("REQ BOY===", req.body);
  let output = { status: null, data: null, msg: null };
  //who want to send order their pass and walletaddr
  const walletPRIVKEY = req.body.privateKey;
  const walletAddress = req.body.walletAddress;
  const productOrderId = req.body.productOrderId;
  const id = req.body.id;
  const contractAddress = req.body.contractAddress;
  var date_variable = new Date();
  var year = date_variable.getFullYear();
  var month = date_variable.getMonth() + 1;
  var day = date_variable.getDate();
  let date = year + "-" + month + "-" + day;

  const UnixDate = new Date(date).getTime() / 1000;

  console.log("UnixDate", UnixDate);

  var minABI = HuxtTechDealABI;
  //get courier details walletAddress
  const courierInfoQuery = `SELECT courier_request.* , product_order_details.orderNo
  FROM courier_request
  JOIN product_order_details
  ON courier_request.productOrderId = product_order_details.id
  WHERE courier_request.id = '${id}' AND courier_request.assigned IS NULL`;
  const courierInformation = await new Promise((resolve, reject) => {
    conn.query(courierInfoQuery, (err, result) => {
      console.log("ERROR", err, result);
      if (err) {
        return null;
      } else {
        return resolve(result);
      }
    });
  });

  //if user does not exist
  if (courierInformation.length == 0) {
    return res.status(200).json({
      msg: TextString.Data_Not_Found,
      statis: responseStatus.STATUS_BAD_REQUEST,
    });
  } else {
    let orderNo = courierInformation[0].orderNo;
    let courierAddress = courierInformation[0].walletAddress;

    let courierRequestUpdate = `UPDATE courier_request SET assigned ="${1}" WHERE id = '${id}'`;
    conn.query(courierRequestUpdate, async (err, result) => {
      if (err) {
        return res.status(200).json({
          msg: TextString.Price_Insert_Failed,
          data: null,
          statis: responseStatus.STATUS_NOT_FOUND,
        });
      }
    });
    let productOrderUpdate = `UPDATE product_order_details SET courierId ="${courierInformation[0].id}" WHERE id = '${productOrderId}'`;
    conn.query(productOrderUpdate, async (err, result) => {
      if (err) {
        return res.status(200).json({
          msg: TextString.Price_Insert_Failed,
          data: null,
          statis: responseStatus.STATUS_NOT_FOUND,
        });
      }
    });
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
            .sendInvoice(orderNo, UnixDate, courierAddress)
            .encodeABI(),
        };
        // kovin 42, rinyby 4
        const tx = new Tx(txObject, { chain: 42 });
        tx.sign(privateKey);

        const serializedTx = tx.serialize();
        const raw = "0x" + serializedTx.toString("hex");
        await web3.eth.sendSignedTransaction(raw).then(function (result) {
          trxHash = result.transactionHash;
          contract.getPastEvents(
            "InvoiceSent",
            {
              filter: { transactionHash: [trxHash] },
            },
            function (error, output) {
              let finalDate = output[0].returnValues["delivery_date"];
              let invoiceNo = output[0].returnValues["invoiceseq"];
              if (!error) {
                let productUpdateQuery = `UPDATE product_order_details SET deliveryDate ="${finalDate}",invoiceNo ='${invoiceNo}' WHERE id = '${productOrderId}'`;
                conn.query(productUpdateQuery, async (err, result) => {
                  console.log("ERROR++++++++++", result);
                  if (err) {
                    return res.status(200).json({
                      msg: TextString.Courier_Assigned_Failed,
                      data: null,
                      statis: responseStatus.STATUS_NOT_FOUND,
                    });
                  }
                });
                return res.status(200).json({
                  msg: TextString.Courier_Assigned_Successful,
                  data: null,
                  statis: responseStatus.STATUS_NOT_FOUND,
                });
              } else {
                return res.status(200).json({
                  msg: TextString.Courier_Assigned_Failed,
                  data: null,
                  statis: responseStatus.STATUS_NOT_FOUND,
                });
              }
            }
          );
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
  }
};

//verify photo of the order by seller
const verifyPhotoSeller = async (req, res, next) => {
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

module.exports = {
  requestedOrder,
  accpetOrder,
  processingOrder,
  setProductPrice,
  setShipmentPrice,
  courierRequest,
  acceptCourierRequest,
  verifyPhotoSeller,
};
