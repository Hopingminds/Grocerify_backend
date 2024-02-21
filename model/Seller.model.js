import mongoose from "mongoose";
import { AddressSchema } from "./Address.model.js";

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
    OwnerAddress: {
        type:AddressSchema
    },
    profile: { type: String}
});

export default mongoose.model.Sellers || mongoose.model('Seller', SellerSchema);