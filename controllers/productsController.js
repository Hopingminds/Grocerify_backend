import productModel from '../model/Products.model.js'

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

/** PUT: http://localhost:8080/api/addToCart 
 * @param: {
    "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function addToCart(req, res) {
	try {
		const { userID } = req.user;
		const body = req.body
		if (!userID) return res.status(401).send({ error: 'Invalid User!' })

		const updateUser = new Promise((resolve, reject) => {
			// update the data
			UserModel.updateOne({ _id: userID }, body)
            .exec()
            .then(()=>{
                resolve()
            })
            .catch((error)=>{
                throw error
            })
		})
        
        Promise.all([updateUser])
        .then(()=>{
            return res.status(201).send({ msg : "Record Updated"});
        })
        .catch((error) => {
            return res.status(500).send({ error: error.message })
        })

	} catch (error) {
		return res.status(401).send({ error })
	}
}