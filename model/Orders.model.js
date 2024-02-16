import mongoose from "mongoose";
import ProductsModel from "./Products.model.js";
import UserModel from "./User.model.js";
import { AddressSchema } from "./Address.model.js";

export const WishlistSchema = new mongoose.Schema({
    _id :{ type: mongoose.Schema.Types.ObjectId, 
        auto: false, 
        required: true 
    },
    Orders: [
        {
            "status":{
                type:String,
            },
            "ordered_on":{
                type:Date
            },
            "discound_coupon":{},
            "delivered_on":{
                type:Date
            },
            "shipping_address":{
                type: AddressSchema
            },
            product:{
                type: ObjectId,
                ref: ProductsModel,
            },
            ordered_by:{
                type: ObjectId,
                ref: UserModel,
            }
        }
    ]
}, { _id: false });

export default mongoose.model.Orders || mongoose.model('Orders', WishlistSchema);