import productsModel from '../model/Products.model.js'
import OrdersModel from '../model/Orders.model.js'

// helper function
function percentage(percent, total) {
    return ((percent/ 100) * total).toFixed(2)
}

/** POST: http://localhost:8080/api/order 
 * @param: {
    "header" : "Bearer <token>"
}
body: {
    "discount_coupon":{
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
    "products":[
        {
            "productid":"65d2fdd5020dd810551d66e7",
            "quantity":2
        },
        {
            "productid":"65d2fdd5020dd810551d66e3",
            "quantity":1
        }
    ]
}
*/
export async function order(req, res) {
    try {
        const { userID } = req.user;
        const { discount_coupon, shipping_address, products } = req.body;

        if (!userID) return res.status(401).send({ error: 'User Not Found...!' });

        const orders = [];
        let totalPrice = 0;

        for (const item of products) {
            const { productid, quantity } = item;
            const product = await productsModel.findById(productid);

            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${productid} not found` });
            }
            
            let calculatedPrice = ((product.variants1_mrp_price - percentage(product['variants1_discount%'], product.variants1_mrp_price)) * quantity) - discount_coupon.discount_price
            totalPrice += calculatedPrice
            orders.push({
                discount_coupon,
                shipping_address,
                product: productid,
                quantity,
                order_price: calculatedPrice,
                ordered_on: new Date()
            });
        }

        // Find the cart for the user
        let order = await OrdersModel.findOne({ _id: userID });

        // If the user has no cart, create a new one
        if (!order) {
            order = new OrdersModel({ _id: userID, Orders: [] });
        }

        order.Orders.push(...orders);

        await order.save();

        res.status(201).json({ success: true, msg: 'Ordered successfully', total_price: totalPrice });
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