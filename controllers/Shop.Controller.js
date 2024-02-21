import shopModel from '../model/Shop.model.js'

/** POST: http://localhost:8080/api/addshop
* @body : {
    "shopName": "Vivek Criayana Store",
	"OwnerEmail": "vivekdude69@gmail.com",
	"OwnerName": "Vivek Kumar",
	"OwnerNumber": "2136782340",
	"OwnerAddress": "475-B Type-2 RCF Kapurthala, Punjab - 144602",
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
