import shopModel from '../model/Shop.model.js'
import { registerMail } from './mailer.js'
/** POST: http://localhost:8080/api/addshop
* @body : {
    "shopName": "Vivek Criayana Store",
	"OwnerEmail": "vivekdude69@gmail.com",
	"OwnerName": "Vivek Kumar",
	"OwnerNumber": "2136782340",
	"ShopAddress": "475-B Type-2 RCF Kapurthala, Punjab - 144602",
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
	"product_primary_image_url": "https://lh3.googleusercontent.com/p/AF1QipNHIMZzyYXnvQuTLm0OcMclqAihOIIUD1MIp7Vb=w1080-h608-p-no-v0",
    "shopImage":[
		"https://lh3.googleusercontent.com/p/AF1QipNHIMZzyYXnvQuTLm0OcMclqAihOIIUD1MIp7Vb=w1080-h608-p-no-v0",
		"https://lh3.googleusercontent.com/p/AF1QipNHIMZzyYXnvQuTLm0OcMclqAihOIIUD1MIp7Vb=w1080-h608-p-no-v0",
		"https://lh3.googleusercontent.com/p/AF1QipNHIMZzyYXnvQuTLm0OcMclqAihOIIUD1MIp7Vb=w1080-h608-p-no-v0"
	]
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
/** POST: http://localhost:8080/api/approveshop 
    body:{
        "shopID" : "65d5cc7099b71d0b88a6506c",
        "approved": true
    }
*/
export async function approveshop(req, res) {
	let { shopID, approved } = req.body
	let shop = await shopModel.findOne({ _id: shopID })

	try {
		// If the user has no cart, create a new one
		if (!shop) {
			return res
				.status(500)
				.json({ success: false, msg: 'Wrong shop ID' })
		}

		if (approved && !shop.approved) {
			await shopModel.updateOne({ _id: shopID }, { approved: approved })
			registerMail(
				{
					body: {
						username: shop.OwnerName,
						userEmail: shop.OwnerEmail,
						subject: 'Congratulations - Shop Approved!',
						text: `Congratulations your shop is now approved.
                                Go to the link http://localhost/merchant/forgotpassword 
                                to reset your password with email.`,
					},
				},
				{
					status(status) {
						if (status === 200) {
							return res.status(200).json({
								success: true,
								msg: 'Shop approved and login credentials mailed to owner.',
							})
						} else {
							return res.status(200).json({
								success: true,
								msg: 'Shop approved but failed to send mail',
								mail: shop.OwnerEmail,
							})
						}
					},
				}
			)
		} else {
			return res
				.status(500)
				.json({ success: false, msg: 'Shop is already approved.' })
		}
		if (!approved) {
			await shopModel.deleteOne({ _id: shopID })
			return res.status(200).json({
				success: true,
				msg: 'Shop is set to not approved.',
			})
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, msg: 'Internal server error' })
	}
}
// GET: http://localhost:8080/api/getshops
export async function getShops(req, res) {
	try {
		const shops = await shopModel.find({})
		res.status(200).json({success: true, data:shops})
	} catch (err) {
		res.status(500).send({success: false, msg: 'Internal Server Error'})
	}
}
