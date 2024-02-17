import {Router} from 'express'
const router = Router()
import * as controller from '../controllers/userController.js'
import * as fileController from '../controllers/fileController.js'
import * as productsController from '../controllers/productsController.js'
import * as ordersController from '../controllers/OrdersConroller.js'
import { registerMail } from '../controllers/mailer.js'
import { generateMobileOTP, verifyMobileOTP } from '../controllers/mobileOtp.js'
import Auth, { localVariables } from '../middleware/auth.js'


/** POST Methods */
router.route('/register').post(controller.register)
router.route('/addaddress').post(Auth, controller.addAddress); // is use to add user address
router.route('/registerMail').post(registerMail) // register mail
router.route('/authenticate').post(controller.verifyUser,(req,res)=>res.end()) // authenticate user
router.route('/loginWithEmail').post(controller.verifyUser,controller.loginWithEmail) // login in app with email
router.route('/loginWithMobile').post(controller.verifyUser,controller.loginWithMobile) // login in app with mobile
//-- File Handler
router.route('/upload').post(fileController.handleFileUpload, fileController.upload) // upload xlsx file
//-- POST product data
router.route('/addtocart').post(controller.verifyUser, productsController.addToCart); // is use to add to cart
router.route('/removefromcart').post(controller.verifyUser, productsController.removeFromCart); // is use to remove from cart
router.route('/addtowishlist').post(controller.verifyUser, productsController.addtowishlist); // is use to add to wishlist
router.route('/removefromwishlist').post(controller.verifyUser, productsController.removeFromWishlist); // is use to remove from wishlist
//-- POST Orders
router.route('/order').post(Auth, ordersController.order); // is use to remove from wishlist



/** GET Methods */
router.route('/user').get(controller.verifyUser, controller.getUser) // user with username
router.route('/generateRestPwdOTP').get(controller.verifyUser, localVariables, controller.generateRestPwdOTP) //generate random OTP
router.route('/verifyRestPwdOTP').get(controller.verifyRestPwdOTP) // verify generated OTP
router.route('/createResetSession').get(controller.createResetSession) // reset all variables
//-- GET product data
router.route('/products').get(productsController.products) // get all products data
router.route('/product/:productname').get(productsController.getProductByName) // get all products data
router.route('/getcart').get(controller.verifyUser, productsController.getcart) //generate random OTP
router.route('/getwishlist').get(controller.verifyUser, productsController.getwishlist) //generate random OTP
//-- POST Orders
router.route('/getorders').get(Auth, ordersController.getorders) //generate random OTP


// mobile OTP Verification
router.route('/generateMobileOTP').post(generateMobileOTP) // generate mobileOTP
router.route('/verifyMobileOTP').post(verifyMobileOTP) // generate mobileOTP


/** PUT Methods */
router.route('/updateuser').put(Auth, controller.updateUser); // is use to update the user profile
router.route('/updateaddress').put(Auth, controller.updateAddress); // is use to update user address
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword) // used to reset password

/** DELETE Methods */
router.route('/removeaddress').delete(Auth, controller.removeAddress); // is use to add user address

export default router