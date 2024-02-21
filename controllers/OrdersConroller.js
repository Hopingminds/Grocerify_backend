import productsModel from '../model/Products.model.js'
import OrdersModel from '../model/Orders.model.js'

/** POST: http://localhost:8080/api/order 
 * @param: {
    "header" : "Bearer <token>"
}
body: {
    "discound_coupon":{
        "coupon_code":"NEW-100",
        "discount_price":"50"
    },
    "shipping_address":{ -- address_object
        "full_name": "Hoping Minds",
        "address_line_1": "Sectore-75",
        "address_line_2": "Corporate Greens",
        "landmark": "2nd Floor",
        "city": "Mohali",
        "state": "Mohali",
        "country": "India",
        "latitude": "-10937484.3829",
        "longitude": "3249323.32333",
        "mobile": 9814740275,
        "zip": 144002,
        "type": "Office"
    },
    "productid":"65c4ba60866d0d5a6fc4a827",
    "quantity":2
}
*/
export async function order(req, res) {
	try {
        const { userID } = req.user;
        const {discound_coupon, shipping_address, productid, quantity} = req.body;
        const product = await productsModel.findById(productid);

        if (!userID) return res.status(401).send({ error: 'User Not Found...!' });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        
        // Find the cart for the user
        let order = await OrdersModel.findOne({ _id:userID }).populate('products.product');

        // If the user has no cart, create a new one
        if (!order) {
            order = new OrdersModel({ _id:userID, Orders: [] });
        }
        
        let calculated_price = product.variants1_mrp_price-( product.variants1_mrp_price*product['variants1_discount%']/100 ) - discound_coupon.discount_price
        order.Orders.push({ discound_coupon, shipping_address, product:productid, quantity, order_price:calculated_price ,ordered_on:new Date()});

        await order.save();

        res.status(201).json({success: true, msg: 'Ordered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}

/** GET: http://localhost:8080/api/getorders
 * @param: {
    "header" : "Bearer <token>"
}
*/
export async function getorders(req, res) {
	const { userID } = req.user;
	try {
        // Find the cart document and populate the products field with product data
        const orders = await OrdersModel.findOne({_id:userID}).populate('Orders.product');

        if (!orders) {
            return res.status(404).json({ success: false, message: 'No orders history!' });
        }

        res.status(200).json({ success: true, orders:orders.Orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}