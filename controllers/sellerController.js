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
 * body: {
    "email": "sahilkumar142002@gmail.com",
    "productData":{
        "slug":"apple-fruit",
        "products_title":"Apple Fruit",
        "products_description":"An apple is a round, edible fruit produced by an apple tree. Apple trees are cultivated worldwide and are the most widely grown species in the genus Malus. The tree originated in Central Asia, where its wild ancestor, Malus sieversii, is still found.",
        "brand":"",
        "product_primary_image_url":"https://cdn.britannica.com/22/187222-050-07B17FB6/apples-on-a-tree-branch.jpg",
        "product_images_url":[
        "https://cdn.britannica.com/22/187222-050-07B17FB6/apples-on-a-tree-branch.jpg",
        "https://domf5oio6qrcr.cloudfront.net/medialibrary/11525/0a5ae820-7051-4495-bcca-61bf02897472.jpg",
        "https://static.tnn.in/thumb/msid-94915915,thumbsize-65898,width-1280,height-720,resizemode-75/94915915.jpg"
        ],
        "product_videos_url":[
            "https://www.youtube.com/watch?v=zSWq8qI_cN0",
            "https://www.youtube.com/watch?v=zSWq8qI_cN0"
        ],
        "tags":"Featured Popular",
        "parent_category_name":"Fruits",
        "sub_category_name":"Apple",
        "variants1_weight":"500gm",
        "variants1_mrp_price":100,
        "variants1_discount%":5,
        "variants1_unit_type":"Fruit",
        "rating":3,
        "stock":"40 K.g."
    }
    }
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

/** GET: http://localhost:8080/api/productsbystore */
export async function productsbystore(req, res) {
    let { category, subcategory, sort, price_min, price_max, search, shop } = req.query;

    if (!shop) {
        return res.status(500).send('No shop id passed.');
    }

    try {
        let query = { store: shop }; // Query for products belonging to the specified shop

        // Add category and subcategory to the query if provided
        if (category) {
            query.parent_category_name = category;
        }
        if (subcategory) {
            query.sub_category_name = subcategory;
        }

        // Add price range to the query if provided
        if (price_min !== undefined && price_max !== undefined) {
            query.variants1_mrp_price = { $gte: price_min, $lte: price_max };
        } else if (price_min !== undefined) {
            query.variants1_mrp_price = { $gte: price_min };
        } else if (price_max !== undefined) {
            query.variants1_mrp_price = { $lte: price_max };
        }

        if (search) {
            query.products_title = { $regex: search, $options: 'i' };
        }

        // Build the sort object based on the 'sort' parameter
        let sortObj = {};
        if (sort === 'price_asc') {
            sortObj.variants1_mrp_price = 1;
        } else if (sort === 'price_desc') {
            sortObj.variants1_mrp_price = -1;
        }

        // Find shop and populate products based on the query and sort criteria
        const shopWithProducts = await ShopModel.findById(shop).populate({
            path: 'products',
            match: query, // Apply the query
            options: { sort: sortObj } // Apply the sort
        });

        if (!shopWithProducts) {
            return res.status(404).send('Shop not found');
        }

        res.status(200).json(shopWithProducts.products);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}