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

export const updateForumThread = async(req,res)=>{
  try{
    const{title, content} = req.body
    const thread = await Forum.findById(req.params.id)

    if (!thread) return res.status(404).json({message:"Thread not found"})
    if (thread.author.toString() !== req.user._id.toString()){
      return res.status(403).json({message: "Only the original author can edit this thread"})

    }
    thread.title = title || thread.title
    thread.content = content || thread.content
    await thread.save()

    const io = req.app.get("socketio")
    io.emit("thread_updated",{threadId: thread._id, title: thread.title, content: thread.content})
    res.status(200).json({success: true, message: 'Thread updated!', thread})

  }catch(error){
    res.status(500).json({message: "Server error during updation", error: error.message})
  }
}

export const deleteForumThread = async (req,res)=>{
  try {
    const thread = await Forum.findById(req.params.id)
    if(!thread) return res.status(404).json({message:"Thread not found"})
    if (thread.author.toString() !== req.user._id.toString()){
      return res.status(403).json({message:"Not authorized to delete this thread"})
    }   
    await thread.deleteOne()

    const io= req.app.get("socketio")
    io.emit("thread_deleted", {threadID:req.params.id})
    res.status(200).json({success:true, message:"Thread permanently removed"})

  }catch (error){
    res.status(500).json({message: "Server error during deletion", error: error.message})
  }
}


export const addThreadReply = async (req, res)=> {
  try{
    const {content} = req.body
    if(!content) return  res.status(400).json({message: "Reply content can not be empty"})
    
    const thread = await Forum.findById(req.params.id)
    if(!thread) return res.status(404).json({message:"Thread not found"})  

    const newReply = {author: req.user._id, content} 
    thread.replies.push(newReply) 
    thread.repliesCount = thread.replies.length
    await thread.save()

    const updatedThread  = await Forum.findById(thread._id).populate("replies.author", "name avatar")
    const savedReply = updatedThread.replies[updatedThread.replies.length -1]
 
    const io = req.app.get("socketio")
    io.emit("new_reply", {threadId: thread._id, reply: savedReply, repliesCount: thread.repliesCount})
   
    res.status(201).json({success: true , reply: savedReply})

  }catch(error){
    res.status(500).json({message: "Server error adding reply", error: error.message}) 
  }
}

export const updateThreadReply = async (req, res)=>{
  try{
    const {content} = req.body
    const thread = await Forum.findById(req.params.threadId)
    if(!thread) return res.status(404).json({message:"Thread not found"})

    const reply = thread.replies.id(req.params.replyId)
    if(!reply) return res.status(404).json({message:"Reply not found"})

    if(reply.author.toString() !== req.user._id.toString()){
      return res.status(403).json({message:"Not authorized to edit this"})
    }  

    reply.content= content || reply.content 
    await thread.save()

    const io = req.app.get("socketio")
    io.emit("reply_updated", {threadId: thread._id, replyid: reply._id, content: reply.content })
    
    res.status(200).json({success:true, reply})
  }catch(error){
    res.status(500).json({message:"Server error updating reply", error: error.message})
  }
}

export const deleteThreadReply = async (req,res)=>{
  try{
    const thread = await Forum.findById(req.params.threadId)
    if(!thread) return res.status(404).json({message:"Thread not found"})
    
    const reply = thread.replies.id(req.params.replyId)
    if(!reply) return res.status(404).json({message:"Reply not found"})
  
    if(reply.author.toString() !== req.user._id.toString()){
      return res.status(403).json({message:"Not authorized to delete this reply"})
    }

    reply.deleteOne()
    thread.repliesCount = thread.replies.length
    await thread.save()

    const io= req.app.get("socketio")
    io.emit('reply_deleted', { threadId: thread._id, replyId: req.params.replyId, repliesCount: thread.repliesCount });

    res.status(200).json({success: true, message:"Reply removed"})

    }catch(error){
      res.status(500).json({message:"Server error deleting reply",error : error.message})
    } 
}