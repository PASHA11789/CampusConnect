import Forum from "../models/Forum.js"
import User from "../models/User.js"

export const getForumSummary = async(req , res) =>{

try{
    const threads= await Forum.find()
    .sort({ createdAt: -1 })
    .populate('author', 'name avatar') 
    .select('title repliesCount createdAt')

    res.status(200).json({
        success:true,
        count: threads.length,
        threads,
    })

}catch(error ){
    res.status(500).json({
        success:false,
        message: "Failed to load forum feed summary",
        error: error.message,
    })
}

}

export const createForumThread = async(req,res)=>{
    try{
        const {title,content} =req.body
        if(!title || !content) return res.status(400).json({ message: 'Title and content are required' })
    
        const newThread= await Forum.create({
        title,
        content,
        author:req.user._id,
       })
    
       const populatedThread = await Forum.findById(newThread._id)
       .populate('author','name avatar')
       .select("title repliesCount createdAt")

       const io = req.app.get("socketio")
       io.emit('new_forum_thread', {
      message: `${req.user.name} started a new topic!`,
      thread: populatedThread
    });

       res.status(201).json({
      success: true,
      message: 'Discussion thread published!',
      thread: populatedThread,
    });

    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create discussion thread",
      error: error.message,
    });
  }
};