import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    price:{type: Number, required: true},
    description:{type: String, default:""},
    image:{type:String, default:""},
    isAvailable:{type:Boolean, default: true}
})

const restaurantSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    owner:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    phone:{type: String, required: true},
    address:{type:String, required:true},
    coverImage:{type: String, default:""},
    deliveryRadiusKm:{type:Number, default: 7},
    menu:[menuItemSchema],
    isActive:{type:Boolean, default:true}

}, {timestamps:true})

const Restaurant = mongoose.model("Restaurant", restaurantSchema)
export default Restaurant