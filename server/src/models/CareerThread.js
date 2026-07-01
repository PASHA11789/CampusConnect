import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    author:{type: mongoose.Schema.Types.ObjectId, ref: "User", required:true},
    content:{type: String, required: true},
    createdAt: {type: Date, default: Date.now}
})

const careerThreadSchema = new mongoose.Schema({
    title:{type: String, required: true, trim: true},
    content :{type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},

    category: {
        type: String,
        enum: [
            "job_opportunity",
            "mentorship_qa",
            "general_discussion"
        ],

        required : true
    },

    isFlagged: {type: Boolean, default: false},
    flagReason: {type: String, default: null},
    
    replies:[replySchema],

    isActive: {type: Boolean, default: true}
},{timestamps: true})

const CareerThread  = mongoose.model("CareerThread", careerThreadSchema)
export default CareerThread