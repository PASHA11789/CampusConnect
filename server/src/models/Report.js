import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  targetUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  type: {
    type: String,
    enum: ['Profile_Violation', 'Forum_Violation', 'Petition_Violation', 'Other'],
    default: 'Profile_Violation'
  },
  
  reason: { 
    type: String, 
    required: true 
  },
  
  details: { 
    type: String, 
    default: "No additional details provided." 
  },
  
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Dismissed', 'Resolved'],
    default: 'Pending'
  }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;