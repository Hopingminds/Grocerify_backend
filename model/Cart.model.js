import mongoose from "mongoose";
import ProductsModel from "./Products.model.js";
export const CartSchema = new mongoose.Schema({
    _id :{ type: ObjectId, 
        auto: true, 
        required: true 
    },
    products: [
        {
            product:{
                type: ObjectId,
                ref: ProductsModel,
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
}, { _id: false });

export default mongoose.model.Carts || mongoose.model('Cart', CartSchema);