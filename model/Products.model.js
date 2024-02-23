import mongoose from 'mongoose'
import ShopModel from "./Shop.model.js";
export const productSchema = new mongoose.Schema({
	"slug":{
		type: String,
	},
	"products_title":{
		type: String,
	},
    "products_description":{
		type: String,
	},
    "brand":{
		type: String,
	},
    "product_primary_image_url":{
		type: String,
	},
    "product_images_url":{
		type: Array,
	},
    "product_videos_url":{
		type: Array,
	},
    "tags":{
		type: String,
	},
    "parent_category_name":{
		type: String,
	},
    // "parent_category_image":{
	// 	type: String,
	// },
    "sub_category_name":{
		type: String,
	},
    // "sub_category_image":{
	// 	type: String,
	// },
    "variants1_weight":{
		type: String,
	},
    "variants1_mrp_price":{
		type: Number,
	},
    "variants1_discount%":{
		type: Number,
	},
    "variants1_unit_type":{
		type: String,
	},
    "rating":{
		type: Number,
	},
	"stock":{
		type: String,
		default: 10
	},
	"store":{
		type: mongoose.Schema.Types.ObjectId,
        ref: ShopModel
	}
})

export default mongoose.model.inventories || mongoose.model('inventory', productSchema)
