import sellerModel from '../model/Seller.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ENV from '../config.js'
import ShopModel from '../model/Shop.model.js'
import ProductsModel from '../model/Products.model.js'

// middleware for verify seller
export async function verifySeller(req, res, next) {
	try {
		const { email, mobile } = req.method == 'GET' ? req.query : req.body
		// check the seller existance
		if (email && !mobile) {
			let exit = await sellerModel.findOne({ OwnerEmail:email })
			if (!exit)
				return res.status(404).send({ error: "Can't find seller!" })
			req.sellerID = exit._id
			next()
		} else if (!email && mobile) {
			let exit = await sellerModel.findOne({ OwnerMobile:mobile })
			if (!exit)
				return res.status(404).send({ error: "Can't find seller!" })
			req.sellerID = exit._id
			next()
		}
	} catch (error) {
		return res.status(404).send({ error: 'Authentication Error' })
	}
}

/** POST: http://localhost:8080/api/registerseller
* @param : {
    "password" : "admin123",
    "OwnerEmail": "example@gmail.com",
    "OwnerName" : "bill",
	"OwnerDOB" : "OwnerDOB"
    "OwnerMobile": 8009860560,
	"PanCard" : "JYNPK&$^$J",
	"Aadhar" : 475881278859,
	"OwnerAddress": "ass-a dass asad 122309",
    "OwnerProfile": "" (not compuslory)
}
*/
export async function registerseller(req, res) {
	try {
		const { OwnerEmail, OwnerName, OwnerMobile, OwnerProfile, password, OwnerDOB, OwnerAddress, Aadhar, PanCard } =
			req.body
		// check for existing mobile number
		const existMobile = sellerModel.findOne({ OwnerMobile }).exec()

		// check for existing email
		const existEmail = sellerModel.findOne({ OwnerEmail }).exec()

		// Checking for existing mobile and email
		const [mobileExist, emailExist] = await Promise.all([
			existMobile,
			existEmail,
		])

		if (mobileExist) {
			return res.status(400).send({success: false, msg: 'User with mobile already exsist.'})
		}

		if (emailExist) {
			return res.status(400).send({success: false, msg: 'User with email already exsist.'})
		}
		if (password) {
			const hashedPassword = await bcrypt.hash(password, 10)
			const seller = new sellerModel({
				password: hashedPassword,
				OwnerProfile: OwnerProfile || '',
				OwnerEmail,
				OwnerName,
				OwnerMobile,
				OwnerDOB,
				OwnerAddress,
				Aadhar,
				PanCard
			})

			// Save the seller
			await seller.save()
			// Send response with _id and email
			return res.status(201).send({success: true, msg: 'Seller Registred Successfully.'})
		}
	} catch (error) {
		return res.status(500).send({success: false, msg: 'Internal Server Error.'})
	}
}

/** GET: http://localhost:8080/api/seller 
	query: {
    --pass only one email or mobile according to reset with mobile or reset with email
    "email": "example@gmail.com",
    "mobile": 8009860560,
}
*/
export async function getSeller(req, res) {
	let sellerID = req.sellerID
	try {
		const sellerData = await sellerModel
			.findOne({ _id: sellerID })
			.populate('Shop')

		if (!sellerData) {
			return res
				.status(404)
				.json({ success: false, msg: 'Seller not found' })
		}
		const { password, ...rest } = sellerData.toObject()
		res.status(200).json({ success: true, data: rest })
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, msg: 'Internal server error' })
	}
}

/** POST: http://localhost:8080/api/addstoreproducts 
 * body: {
        "email": "sahilkumar142002@gmail.com",
        "productIDs": [
            "65d98e068f61d2603fe62548",
            "65d98e068f61d2603fe62549",
            "65d98e068f61d2603fe6254c"
        ]
    }
*/
export async function addstoreproducts(req, res) {
	let sellerID = req.sellerID
	let { productIDs } = req.body // Assuming productIDs is an array of product IDs
	let alredypresent = []
	try {
		const sellerData = await sellerModel.findOne({ _id: sellerID })

		if (!sellerData) {
			return res
				.status(404)
				.json({ success: false, msg: 'Seller not found' })
		}

		let shop = await ShopModel.findOne({ _id: sellerData.Shop })

		if (!shop) {
			return res
				.status(404)
				.json({ success: false, msg: 'Seller has no registered shop.' })
		}

		for (const productID of productIDs) {
			const product = await ProductsModel.findOne({ _id: productID })

			if (!product) {
				return res
					.status(404)
					.json({
						success: false,
						msg: `Product with ID ${productID} not found`,
					})
			}
			if (product.stores.includes(shop._id)) {
				alredypresent.push(productID)
			} else {
				product.stores.push(shop._id)
				await product.save().then((data) => {
					try {
						shop.products.push(data._id)
					} catch (err) {
						return res
							.status(500)
							.json({
								success: false,
								msg: 'Internal server error',
							})
					}
				})
			}
		}

		await shop.save()

		res.status(200).json({
			success: true,
			msg: 'Products added successfully!',
			alredypresent,
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, msg: 'Internal server error' })
	}
}
/** GET: http://localhost:8080/api/productsbystore */
export async function productsbystore(req, res) {
	let { category, subcategory, sort, price_min, price_max, search, shop } =
		req.query

	if (!shop) {
		return res.status(500).send('No shop id passed.')
	}

	try {
		let query = { store: shop } // Query for products belonging to the specified shop

		// Add category and subcategory to the query if provided
		if (category) {
			query.parent_category_name = category
		}
		if (subcategory) {
			query.sub_category_name = subcategory
		}

		// Add price range to the query if provided
		if (price_min !== undefined && price_max !== undefined) {
			query.variants1_mrp_price = { $gte: price_min, $lte: price_max }
		} else if (price_min !== undefined) {
			query.variants1_mrp_price = { $gte: price_min }
		} else if (price_max !== undefined) {
			query.variants1_mrp_price = { $lte: price_max }
		}

		if (search) {
			query.products_title = { $regex: search, $options: 'i' }
		}

		// Build the sort object based on the 'sort' parameter
		let sortObj = {}
		if (sort === 'price_asc') {
			sortObj.variants1_mrp_price = 1
		} else if (sort === 'price_desc') {
			sortObj.variants1_mrp_price = -1
		}

		// Find shop and populate products based on the query and sort criteria
		const shopWithProducts = await ShopModel.findById(shop).populate({
			path: 'products',
			match: query, // Apply the query
			options: { sort: sortObj }, // Apply the sort
		})

		if (!shopWithProducts) {
			return res.status(404).send('Shop not found')
		}

		res.status(200).json({shop:shopWithProducts})
	} catch (err) {
		console.error(err)
		res.status(500).send('Internal Server Error')
	}
}


// logins

/** POST: http://localhost:8080/api/sellerloginWithEmail 
* @param : {
    "email" : "example123@mail.com",
    "password" : "admin123",
}
*/
export async function sellerLoginWithEmail(req, res) {
	const { email, password } = req.body
	try {
		sellerModel.findOne({ OwnerEmail:email })
			.then((seller) => {
				bcrypt
					.compare(password, seller.password)
					.then((passwordCheck) => {
						if (!passwordCheck)
							return res
								.status(400)
								.send({ error: "Wrong password" })

						// create jwt token
						const token = jwt.sign(
							{
								sellerID: seller._id,
								email: seller.OwnerEmail,
								mobile: seller.OwnerMobile,
								shop: seller?.Shop || false
							},
							ENV.JWT_SECRET,
							{ expiresIn: '24h' }
						)
						return res.status(200).send({
							msg: 'Login Successful',
							email: seller.OwnerEmail,
							token,
							shop: seller?.Shop || false
						})
					})
					.catch((error) => {
						return res
							.status(400)
							.send({ error: 'Password does not match' })
					})
			})
			.catch((error) => {
				return res.status(404).send({ error: 'Email not Found' })
			})
	} catch (error) {
		return res.status(500).send(error)
	}
}

/** POST: http://localhost:8080/api/sellerloginWithMobile 
* @param : {
    "mobile" : "1234567890",
    "password" : "admin123",
}
*/
export async function SellerLoginWithMobile(req, res) {
	const { mobile, password } = req.body
	try {
		sellerModel.findOne({ OwnerMobile:mobile })
			.then((seller) => {
				bcrypt
					.compare(password, seller.password)
					.then((passwordCheck) => {
						if (!passwordCheck)
							return res
								.status(400)
								.send({ error: "Wrong password" })

						// create jwt token
						const token = jwt.sign(
							{
								sellerID: seller._id,
								email: seller.OwnerEmail,
								mobile: seller.OwnerMobile,
								shop: seller?.Shop || false
							},
							ENV.JWT_SECRET,
							{ expiresIn: '24h' }
						)
						return res.status(200).send({
							msg: 'Login Successful',
							email: seller.OwnerEmail,
							token,
							shop: seller?.Shop || false
						})
					})
					.catch((error) => {
						return res
							.status(400)
							.send({ error: 'Password does not match' })
					})
			})
			.catch((error) => {
				return res.status(404).send({ error: 'Mobile not Found' })
			})
	} catch (error) {
		return res.status(500).send(error)
	}
}