import ENV from '../config.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import jwt from 'jsonwebtoken'
import sellerModel from '../model/Seller.model.js'
const accountSid = ENV.TWILIO_ACCOUNT_SID
const authToken = ENV.TWILIO_AUTH_TOKEN
const verifySid = ENV.TWILIO_ACCOUNT_VERIFY_SID
const client = require('twilio')(accountSid, authToken)

/** POST: http://localhost:8080/api/generateMobileOTP 
* body : {
    "mobile" : "1234567890",
}
*/
export async function generateMobileOTP(req, res) {
	const { mobile } = req.body

	client.verify.v2
		.services(verifySid)
		.verifications.create({ to: `+91${mobile}`, channel: 'sms' })
		.then((verification) => res.status(201).send({ msg: 'OTP Sent.' }))
		.catch((err) => {
			res.status(500).send({ err: 'Unable to generate OTP' })
		})
}

/** POST: http://localhost:8080/api/verifyMobileOTP 
* body : {
    "mobile" : "1234567890",
    "otp": 0197
}
*/
export async function verifyMobileOTP(req, res) {
	const { mobile, otp } = req.body

	client.verify.v2
		.services(verifySid)
		.verificationChecks.create({
			to: `+91${mobile}`,
			code: otp,
		})
		.then((verification_check) =>
			res.status(201).send({ msg: verification_check.status })
		)
		.catch((err) => {
			res.status(500).send({ err: 'Wrong OTP' })
		})
}

/** POST: http://localhost:8080/api/verifySellerLoginMobileOTP 
* body : {
    "mobile" : "1234567890",
    "otp": 0197
}
*/
export async function verifySellerLoginMobileOTP(req, res) {
	const { mobile, otp } = req.body
	client.verify.v2
		.services(verifySid)
		.verificationChecks.create({
			to: `+91${mobile}`,
			code: otp,
		})
		.then((verification_check) => {
			console.log(verification_check.status);
			try {
				sellerModel
					.findOne({ OwnerMobile: mobile })
					.then((seller) => {
						// create jwt token
						const token = jwt.sign(
							{
								sellerID: seller._id,
								email: seller.OwnerEmail,
								mobile: seller.OwnerMobile,
								shop: seller?.Shop || false,
							},
							ENV.JWT_SECRET,
							{ expiresIn: '24h' }
						)
						return res
							.status(200)
							.send({
								msg: 'Login Successful',
								email: seller.OwnerEmail,
								token,
								shop: seller?.Shop || false,
								verified: seller.Verified,
							})
					})
					.catch((error) => {
						console.log(error);
						return res
							.status(404)
							.send({ error: 'Mobile not Found' })
					})
			} catch (error) {
				console.log(error);
				return res.status(500).send(error)
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send({ err: 'Wrong OTP' })
		})
}
