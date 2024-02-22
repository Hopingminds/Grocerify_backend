import mongoose from "mongoose";

export const SellerSchema = new mongoose.Schema({
    password: {
        type: String,
        required: [true, "Please provide a password"],
        unique : false,
    },
    OwnerEmail: {
        type: String,
        required : [true, "Please provide a unique email"],
        unique: true,
    },
    OwnerName: { type: String},
    OwnerNumber : { type : Number},
    OwnerProfile: { type: String}
});

export default mongoose.model.Sellers || mongoose.model('Seller', SellerSchema);