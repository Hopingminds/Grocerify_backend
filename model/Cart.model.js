import mongoose from "mongoose";

export const CartSchema = new mongoose.Schema({
    userid : {
        type: String,
    },
    products:[
        {
            id : { type: String},
            slug: {type: String},
            quantity: {type: Number}
        }
    ]
});

export default mongoose.model.Carts || mongoose.model('Cart', CartSchema);