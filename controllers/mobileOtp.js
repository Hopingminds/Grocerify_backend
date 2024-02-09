import ENV from '../config.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

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
		.then((verification_check) => res.status(201).send({msg: verification_check.status}))
        .catch((err)=>{
            res.status(500).send({ err: 'Wrong OTP' })
        })
}
