import productModel from '../model/Products.model.js'
import cartModel from '../model/Cart.model.js'
import ProductsModel from '../model/Products.model.js';
/** GET: http://localhost:8080/api/products */
export async function products(req, res) {
	let {category,subcategory,sort,price_min,price_max} = req.query
	// console.log(category,subcategory,sort,price_min,price_max);
	try {
		let query = {};

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

		// Build the sort object based on the 'sort' parameter
		let sortObj = {};
		if (sort === 'price_asc') {
			sortObj.variants1_mrp_price = 1;
		} else if (sort === 'price_desc') {
			sortObj.variants1_mrp_price = -1;
		}
		
		const products = await productModel.find(query).sort(sortObj)
		res.status(200).json(products)
	} catch (err) {
		res.status(500).send('Internal Server Error')
	}
}
/** GET: http://localhost:8080/api/product/:product-slug */
export async function getProductByName(req, res) {
	const { productname } = req.params

	try {
		if (!productname)
			return res.status(501).send({ error: 'Invalid Productname' })

		const checkProduct = new Promise((resolve, reject) => {
			productModel.findOne({ slug:productname })
				.exec()
				.then((product) => {
					if (!product) {
						reject({ error: "Couldn't Find the Product." })
					} else {
						resolve(product)
					}
				})
				.catch((err) => {
					reject(new Error(err))
				})
		})

		Promise.all([checkProduct])
			.then((productDetails) => {
				return res.status(200).send(productDetails)
			})
			.catch((error) => {
				return res.status(500).send({ error: error.message })
			})
	} catch (error) {
		return res.status(404).send({ error: 'Cannot Find Product Data' })
	}
}

/** POST: http://localhost:8080/api/addtocart
body: {
    --pass only one email or mobile according to reset with mobile or reset with email
    "email": "example@gmail.com",
    "mobile": 8009860560,
    "productid": "65c4ba60866d0d5a6fc4a82b",
    "quantity":1
}
*/
export async function addToCart(req, res) {
	let userID = req.userID
	try {
        const { productid, quantity } = req.body;

        // Find the cart for the user
        let cart = await cartModel.findOne({ _id:userID });

        // If the user has no cart, create a new one
        if (!cart) {
            cart = new cartModel({ _id:userID, products: [] });
        }

        // Check if the product already exists in the cart
        const existingProductIndex = cart.products.findIndex(product => product.productid === productid);

        if (existingProductIndex !== -1) {
            // If the product already exists, update its quantity
            cart.products[existingProductIndex].quantity += quantity || 1;
        } else {
            // If the product doesn't exist, add it to the cart
            const product = await ProductsModel.findById(productid);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            cart.products.push({ productid:product.id, quantity });
        }

        await cart.save();

        res.status(201).json({ success: true, message: 'Product added to cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

/** GET: http://localhost:8080/api/getcart
query: {
    --pass only one email or mobile according to reset with mobile or reset with email
    "email": "example@gmail.com",
    "mobile": 8009860560,
}
*/
export async function getcart(req, res) {
	let userID = req.userID
	try {
		const checkCart = new Promise((resolve, reject) => {
			cartModel.findOne({ _id:userID })
				.exec()
				.then((cart) => {
					if (!cart) {
						resolve({msg:'Empty Cart.'})
					} else {
						resolve(cart)
					}
				})
				.catch((err) => {
					reject(new Error(err))
				})
		})

		Promise.all([checkCart])
			.then((cartDetails) => {
				return res.status(200).send(cartDetails)
			})
			.catch((error) => {
				return res.status(500).send({ error: error.message })
			})
	} catch (error) {
		return res.status(404).send({ error: 'Cannot Find User Data' })
	}
}