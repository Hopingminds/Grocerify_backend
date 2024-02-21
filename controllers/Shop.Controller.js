import shopModel from '../model/Shop.model.js'

/** POST: http://localhost:8080/api/addshop
* @body : {
    "mobile":"9608945441",
        or
    "email": "abc@gmail.com"

    "shopName": "Vivek Criayana Store",
    "BusinessLicenceNumber": "AB1234BUSS567",
    "BusinessRegistrationNumber": "BUS123456",
    "TaxIdentificationNumber": "JYNPK7464J",
    "TypeOfProductSold": "Fruits",
    "openingHours":{
        "from": "10:00",
        "to": "22:00"
    },
    "deliveryInfo":{
        "mon": true,
        "tue": true,
        "wed": true,
        "thu": true,
        "fri": true,
        "sat": false,
        "sun": false
    },
    "workingDays": 5,
    "isProvideDeliveryService": true,
    "deliveryArea":"Google Map Data Here",
    "deliveryCharges": 60,
    "shopImage":"https://lh3.googleusercontent.com/p/AF1QipNHIMZzyYXnvQuTLm0OcMclqAihOIIUD1MIp7Vb=w1080-h608-p-no-v0",
    "termsAndCondition": "terms And Condition here",
    "privacyPolicy":"privacy Policy here",
    "returnPolicy" : "return Policy here",
    "refundPolicy": "refund policy here"
    }
}
*/
export async function registerShop(req, res) {
	let userID = req.userID
	try {
		const shopData = req.body
		shopData.Owner = userID
		// If the user has no wishlist, create a new one
		let shop = new shopModel(shopData)
		await shop.save()
		res.status(201).json({ success: true, msg: 'Shop added successfully' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, msg: 'Internal server error' })
	}
}

/** GET: http://localhost:8080/api/getshopdata 
    query:{
        --pass only one email or mobile according to reset with mobile or reset with email
        "email": "example@gmail.com",
        "mobile": 8009860560,
    }
*/
export async function getShopData(req, res) {
	let userID = req.userID
	try {
		// Find the cart document and populate the products field with product data
		const shopData = await shopModel
			.findOne({ Owner: userID })
			.populate('Owner')
		const shopWithoutPassword = {
			...shopData._doc,
			Owner: {
				...shopData.Owner._doc,
				password: undefined,
			},
		}
		if (!shopData) {
			return res
				.status(404)
				.json({ success: false, message: 'No shop found!' })
		}

		res.status(200).json({ success: true, shop: shopWithoutPassword })
	} catch (error) {
		console.error(error)
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		})
	}
}
