import UserModel from '../model/User.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ENV from '../config.js'
import otpGenerator from 'otp-generator'

// middleware for verify user
export async function verifyUser(req, res, next) {
	try {
		const { username } = req.method == 'GET' ? req.query : req.body
		// check the user existance
		let exit = await UserModel.findOne({ username })
		if (!exit) return res.status(404).send({ error: "Can't find user!" })
		next()
	} catch (error) {
		return res.status(404).send({ error: 'Authentication Error' })
	}
}

/** POST: http://localhost:8080/api/register 
* @param : {
    "username" : "example@gmail.com",
    "password" : "admin123",
    "firstName" : "Jone",
    "lastName": "Doe",
    "mobile": 8009860560,
    "address" : "475-E Type-2 RCF",
    "profile": ""
}
*/
export async function register(req, res) {
	try {
		const {
			email,
			password,
			profile,
			firstName,
			lastName,
			mobile,
			// address,
		} = req.body
		console.log({ email, password, firstName, lastName, profile })

		// check for existing email
		const existEmail = new Promise((resolve, reject) => {
			UserModel.findOne({ username: email })
				.exec()
				.then((email) => {
					if (email) {
						reject({ error: 'Please use a unique email' })
					} else {
						resolve()
					}
				})
				.catch((err) => {
					reject(new Error(err))
				})
		})

		Promise.all([existEmail])
			.then(() => {
				if (password) {
					bcrypt
						.hash(password, 10)
						.then((hashedPassword) => {
							const user = new UserModel({
								username: email,
								password: hashedPassword,
								profile: profile || '',
								firstName,
								lastName,
								// address,
								mobile,
							})

							// return save result as a response
							user.save()
								.then((result) =>
									res.status(201).send({
										msg: 'User Register Successfully',
									})
								)
								.catch((error) =>
									res.status(500).send({ error })
								)
						})
						.catch((error) => {
							return res.status(500).send({
								error: 'Enable to hashed password',
							})
						})
				}
			})
			.catch((error) => {
				return res.status(500).send({ error })
			})
	} catch (error) {
		return res.status(500).send(error)
	}
}

/** POST: http://localhost:8080/api/login 
* @param : {
    "username" : "example@gmail.com",
    "password" : "admin123",
}
*/
export async function login(req, res) {
	const { username, password } = req.body
	try {
		UserModel.findOne({ username })
			.then((user) => {
				bcrypt
					.compare(password, user.password)
					.then((passwordCheck) => {
						if (!passwordCheck)
							return res
								.status(400)
								.send({ error: "Don't password" })

						// create jwt token
						const token = jwt.sign(
							{
								userID: user._id,
								username: user.username,
								// accountType: user.accountType,
							},
							ENV.JWT_SECRET,
							{ expiresIn: '24h' }
						)
						return res.status(200).send({
							msg: 'Login Successful',
							username: user.username,
							token,
						})
					})
					.catch((error) => {
						return res
							.status(400)
							.send({ error: 'Password does not match' })
					})
			})
			.catch((error) => {
				return res.status(404).send({ error: 'Username not Found' })
			})
	} catch (error) {
		return res.status(500).send(error)
	}
}

/** POST: http://localhost:8080/api/loginwithgoogle 
* @param : {
    "username" : "example@gmail.com",
    "password" : "admin123",
}
*/
export async function loginwithgoogle(req, res) {
	const { username } = req.body
	try {
		UserModel.findOne({ username })
			.then((user) => {
				// create jwt token
				const token = jwt.sign(
					{
						userID: user._id,
						username: user.username,
						accountType: user.accountType,
					},
					ENV.JWT_SECRET,
					{ expiresIn: '24h' }
				)
				return res
					.status(200)
					.send({
						msg: 'Login Successful',
						username: user.username,
						token,
					})
			})
			.catch((error) => {
				return res.status(404).send({ error: 'Username not Found' })
			})
	} catch (error) {
		return res.status(500).send(error)
	}
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
	req.app.locals.OTP = await otpGenerator.generate(6, {
		lowerCaseAlphabets: false,
		upperCaseAlphabets: false,
		specialChars: false,
	})
	res.status(201).send({ code: req.app.locals.OTP })
}

/** GET: http://localhost:8080/api/verifyOTP  */
export async function verifyOTP(req, res) {
	const { code } = req.query
	if (parseInt(req.app.locals.OTP) === parseInt(code)) {
		req.app.locals.OTP = null //reset OTP value
		req.app.locals.resetSession = true // start session for reset password
		return res.status(201).send({ msg: 'Verify Successsfully!' })
	}
	return res.status(400).send({ error: 'Invalid OTP' })
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
	if (req.app.locals.resetSession) {
		return res.status(201).send({ flag: req.app.locals.resetSession })
	}
	return res.status(440).send({ error: 'Session expired!' })
}
