import {Router} from 'express'
const router = Router()
import * as controller from '../controllers/userController.js'
import * as fileController from '../controllers/fileController.js'
import * as productsController from '../controllers/productsController.js'
import { registerMail } from '../controllers/mailer.js'
import { generateMobileOTP, verifyMobileOTP } from '../controllers/mobileOtp.js'
import Auth, { localVariables } from '../middleware/auth.js'
/** POST Methods */
router.route('/register').post(controller.register)
router.route('/registerMail').post(registerMail) // register mail
router.route('/authenticate').post(controller.verifyUser,(req,res)=>res.end()) // authenticate user
router.route('/loginWithEmail').post(controller.verifyUser,controller.loginWithEmail) // login in app with email
router.route('/loginWithMobile').post(controller.verifyUser,controller.loginWithMobile) // login in app with mobile
//-- File Handler
router.route('/upload').post(fileController.handleFileUpload, fileController.upload) // upload xlsx file
//-- POST product data
router.route('/addtocart').post(controller.verifyUser, productsController.addToCart); // is use to update the user profile

/** GET Methods */
router.route('/user/:username').get(controller.getUser) // user with username
router.route('/generateRestPwdOTP').get(controller.verifyUser, localVariables, controller.generateRestPwdOTP) //generate random OTP
router.route('/verifyRestPwdOTP').get(controller.verifyRestPwdOTP) // verify generated OTP
router.route('/createResetSession').get(controller.createResetSession) // reset all variables

// mobile OTP Verification
router.route('/generateMobileOTP').post(generateMobileOTP) // generate mobileOTP
router.route('/verifyMobileOTP').post(verifyMobileOTP) // generate mobileOTP

//-- GET product data
router.route('/products').get(productsController.products) // get all products data
router.route('/product/:productname').get(productsController.getProductByName) // get all products data

/** PUT Methods */
router.route('/updateuser').put(Auth, controller.updateUser); // is use to update the user profile
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword) // used to reset password


export default router