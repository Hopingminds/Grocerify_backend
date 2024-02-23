import sellerModel from '../model/Seller.model.js'
import bcrypt from 'bcrypt'
import ShopModel from '../model/Shop.model.js';
import ProductsModel from '../model/Products.model.js';
// helper function
function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

// middleware for verify user
export async function verifySeller(req, res, next) {
	try {
		const { email, mobile } = req.method == 'GET' ? req.query : req.body
		// check the user existance
		if (email && !mobile) {
			let exit = await sellerModel.findOne({ email })
			if (!exit) return res.status(404).send({ error: "Can't find seller!" })
			req.sellerID = exit._id
			next()
	}
	
	else if (!email && mobile) {
			let exit = await sellerModel.findOne({ mobile })
			if (!exit) return res.status(404).send({ error: "Can't find seller!" })
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
    "OwnerNumber": 8009860560,
    "OwnerProfile": "" (not compuslory)
}
*/
export async function registerseller(req, res) {
    try {
        const { OwnerEmail, OwnerName, OwnerNumber, OwnerProfile, Shop} = req.body;

        // check for existing mobile number
        const existMobile = sellerModel.findOne({ OwnerNumber }).exec();

        // check for existing email
        const existEmail = sellerModel.findOne({ OwnerEmail }).exec();

        // Checking for existing mobile and email
        const [mobileExist, emailExist] = await Promise.all([existMobile, existEmail]);

        if (mobileExist) {
            return res.status(400)
        }

        if (emailExist) {
            return res.status(400)
        }
        let password = generatePassword()
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const seller = new sellerModel({
                password: hashedPassword,
                OwnerProfile: OwnerProfile || '',
                OwnerEmail, 
                OwnerName, 
                OwnerNumber,
                Shop
            });

            // Save the seller
            await seller.save();
            // Send response with _id and email
            return res.status(201)
        }
    } catch (error) {
        console.log(error);
        return res.status(500);
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
        const sellerData = await sellerModel.findOne({_id:sellerID}).populate('Shop');

        if (!sellerData) {
            return res.status(404).json({ success: false, msg: 'Seller not found' });
        }
		const { password, ...rest } = sellerData.toObject()
        res.status(200).json({ success: true, data:rest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}

/** POST: http://localhost:8080/api/addproduct 
 * 
*/
export async function addProduct(req, res) {
	let sellerID = req.sellerID
    let {productData} = req.body
	try {
        const sellerData = await sellerModel.findOne({_id:sellerID})
        
        if (!sellerData) {
            return res.status(404).json({ success: false, msg: 'Seller not found' });
        }

        let shop = await ShopModel.findOne({ _id:sellerData.Shop });

        if (!shop) {
            return res.status(404).json({ success: false, msg: 'Seller has no registred shop.' });
        }
        
        const product = new ProductsModel(productData);

        // Save the seller
        await product.save().then(data=>{
			try {
                shop.products.push(data._id)
            } catch (err) {
                return res.status(500).json({ success: false, msg: 'Internal server error' });
            }
		});

        await shop.save()

        res.status(200).json({ success: true, msg: 'Product added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}