
const router = require('express').Router()

/**
 * load controllers
 *
 * @type {controller} list of all Controller
 */
 const electionController = require('../controller/huxhController'); 


router.post('/adminLogin', electionController.adminLogin);
router.post('/sendOrderEvent', electionController.sendOrderEvent);
router.post('/owner', electionController.owner);
router.post('/checkHealth', electionController.checkHealth);
router.post('/deployContract', electionController.deployContract);

/**
 * load controllers
 *
 * @type {controller} list of all Controller
 */
 const userController = require('../controller/userController'); 


router.post('/signUp', userController.signUp);
router.post('/login', userController.login);
router.post('/availableProduct', userController.availableProduct);
router.post('/orderRequest', userController.orderRequest);
router.post('/sendOrder', userController.sendOrder);
router.post('/acceptedOrder', userController.acceptedOrder);

/**
 * load controllers
 *
 * @type {controller} list of all Controller
 */
 const productController = require('../controller/productController'); 


router.post('/insertProduct', productController.insertProduct);
router.post('/productList', productController.productList);
router.post('/deployedProductList', productController.deployedProductList);
router.post('/orderList', productController.orderList);

/**
 * load controllers
 *
 * @type {controller} list of all Controller
 */
 const sellerController = require('../controller/sellerController'); 


router.post('/requestedOrder', sellerController.requestedOrder);
router.post('/accpetOrder', sellerController.accpetOrder);
router.post('/processingOrder', sellerController.processingOrder);
router.post('/setProductPrice', sellerController.setProductPrice);
router.post('/setShipmentPrice', sellerController.setShipmentPrice);




router.get('/test', (req, res) => {
    res.send(
        "<h2>Backend Is Running</h2>"
    )
})

module.exports = router