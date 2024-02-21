import mongoose from "mongoose";
import UserModel from "./User.model.js";

export const ShopSchema = new mongoose.Schema({
    shopName: {
        type: String
    },
    Owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: UserModel,
    },
    BusinessLicenceNumber: {
        type: String
    },
    BusinessRegistrationNumber: {
        type: String
    },
    TaxIdentificationNumber: {
        type: String
    },
    TypeOfProductSold: {
        type: String
    },
    openingHours: {
        from:{
            type: String
        },
        to:{
            type: String
        }
    },
    deliveryInfo: {
        mon:{
            type: Boolean,
            default: false,
        },
        tue:{
            type: Boolean,
            default: false,
        },
        wed:{
            type: Boolean,
            default: false,
        },
        thu:{
            type: Boolean,
            default: false,
        },
        fri:{
            type: Boolean,
            default: false,
        },
        sat:{
            type: Boolean,
            default: false,
        },
        sun:{
            type: Boolean,
            default: false,
        }
    },
    workingDays: {
        type: Number
    },
    isProvideDeliveryService: {
        type: Boolean
    },
    deliveryArea: {
        type: String
    },
    deliveryCharges: {
        type: Number
    },
    paymentType: {
        type: Object
    },
    shopImage: {
        type: String
    },
    termsAndCondition: {
        type: String
    },
    privacyPolicy: {
        type: String
    },
    returnPolicy: {
        type: String
    },
    refundPolicy: {
        type: String
    },
});

export default mongoose.model.Shops || mongoose.model('Shop', ShopSchema);