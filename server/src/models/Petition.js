import mongoose from "mongoose";

const petitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    level: {
      type: String,
      enum: ["Class", "Department", "Campus"],
      required: true
    },
   signatures:[{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    
   milestone:{type: Number, default: null},
   status: {
      type: String,
      enum: ["Pending Mod Approval","Active" ,"Under Review", "Resolved", "Closed"],
      default: "Active",
    },
  },
  { timestamps: true },
);

petitionSchema.virtual("currentSignatures").get(function(){
  return this.signatures ? this.signatures.length : 0;
})

petitionSchema.set("toJSON",{virtuals:true})

const Petition = mongoose.model("Petition", petitionSchema);
export default Petition;
