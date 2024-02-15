import mongoose from "mongoose";
export const CartSchema = new mongoose.Schema({
    _id :{ type: mongoose.Schema.Types.ObjectId, 
        auto: true, 
        required: true 
    },
    products: [
        {
            productid:{
                type: String,
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
}, { _id: false });

export default mongoose.model.Carts || mongoose.model('Cart', CartSchema);