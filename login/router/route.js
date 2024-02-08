import {Router} from 'express'
const router = Router()
import * as controller from '../controllers/appController.js'
import { registerMail } from '../controllers/mailer.js'
import { localVariables } from '../middleware/auth.js'
/** POST Methods */
router.route('/register').post(controller.register)
router.route('/registerMail').post(registerMail) // register mail
router.route('/authenticate').post(controller.verifyUser,(req,res)=>res.end()) // authenticate user
router.route('/login').post(controller.verifyUser,controller.login) // login in app
router.route('/loginwithgoogle').post(controller.verifyUser,controller.loginwithgoogle) // login in app

/** GET Methods */
router.route('/generateOTP').get( localVariables, controller.generateOTP) //generate random OTP
router.route('/verifyOTP').get(controller.verifyOTP) // verify generated OTP
router.route('/createResetSession').get(controller.createResetSession) // reset all variables

export default router