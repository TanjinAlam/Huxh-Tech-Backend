
const router = require('express').Router()

/**
 * load controllers
 *
 * @type {controller} list of all Controller
 */
 const electionController = require('../controller/huxhController'); 


router.post('/adminLogin', electionController.adminLogin);
router.post('/sendOrder', electionController.sendOrder);
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



router.get('/test', (req, res) => {
    res.send(
        "<h2>Backend Is Running</h2>"
    )
})

module.exports = router