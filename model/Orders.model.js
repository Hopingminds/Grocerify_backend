import mongoose from "mongoose";
import ProductsModel from "./Products.model.js";
import UserModel from "./User.model.js";
import { AddressSchema } from "./Address.model.js";

export const OrdersSchema = new mongoose.Schema({
    _id :{ type: mongoose.Schema.Types.ObjectId, 
        auto: false, 
        required: true 
    },
    Orders: [
        {
            "_id":{
                type: mongoose.Schema.Types.ObjectId, 
                auto: true, 
                required: true
            },
            "status":{
                type:String,
                default: 'ordered'
            },
            "ordered_on":{
                type:Date
            },
            "discound_coupon":{
                "coupon_code":{
                    type: String,
                    default: null
                },
                "discount_price":{
                    type: Number,
                    default: null
                },
            },
            "delivered_on":{
                type:Date,
                default: null
            },
            "shipping_address":{
                type: AddressSchema
            },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: ProductsModel,
            },
            "order_price":{
                type: Number,
            },
            quantity:{
                type: Number,
                default: 1
            }
        }
    ]
}, { _id: false });

export default mongoose.model.Orders || mongoose.model('Orders', OrdersSchema);