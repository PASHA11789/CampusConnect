import Forum from "../models/Forum.js"
import Notification from "../models/Notification.js"

export const getForumSummary = async(_req , res) =>{

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
        const {title,content, isFlagged} =req.body
        if(!title || !content) return res.status(400).json({ message: 'Title and content are required' })
    
        const newThread= await Forum.create({
        title,
        content,
        author:req.user._id,
        isHidden: isFlagged || false
       })
    
       const populatedThread = await Forum.findById(newThread._id)
       .populate('author','name avatar')
       .select("title repliesCount createdAt")

       const io = req.app.get("socketio")

       if(isFlagged){
      
        await Notification.create({
      
        recipient: req.user._id,
        type: "GENERAL",
        message:"Your recent forum post is under review by moderators to ensure community safety"
        })
        io.to("mod_room").emit("new_flagged_content",{
          message:"AI flagged a new forum post for review",
          threadID: newThread._id
        })

        return res.status(202).json({
          success:true,
          message:"Your post contains specific ketwords and has been sent for moderator review.",
          underReview: true
        })
       }  
       
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
    const{title, content, isFlagged} = req.body
    const thread = await Forum.findById(req.params.id)

    if (!thread) return res.status(404).json({message:"Thread not found"})
    if (thread.author.toString() !== req.user._id.toString()){
      return res.status(403).json({message: "Only the original author can edit this thread"})

    }
    thread.title = title || thread.title
    thread.content = content || thread.content
    thread.isHidden = isFlagged || false
    await thread.save()

    const io = req.app.get("socketio")

    if (isFlagged) {
      await Notification.create({
        recipient: req.user._id,
        type: "GENERAL",
        message: "Your updated forum post is under review by moderators to ensure community safety"
      })
      io.to("mod_room").emit("new_flagged_content", {
        message: "AI flagged an updated forum post for review",
        threadID: thread._id
      })
      return res.status(202).json({
        success: true,
        message: "Your post contains specific keywords and has been sent for moderator review.",
        underReview: true
      })
    }

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

export const toggleHideThread = async (req,res) =>{
  try {
    const thread = await Forum.findById(req.params.id)

    if(!thread) return res.status(404).json({message:"Thread not found"})
     if(req.user.role !== "admin" && req.user.role !== "student_mod"){
      return res.status(403).json({message:"You do not have permission to moderate threads"})
    
     }  
     thread.isHidden = !thread.isHidden
     await thread.save()


     const io = req.app.get("socketio")

     io.emit("thread_moderated",{
      threadId: thread._id,
      isHidden: thread.isHidden 
     })
     res.status(200).json({
      success: true,
      message: thread.isHidden? "Thread hidden from public feed" : "Thread restored to public feed",
      idHidden: thread.isHidden
     })
  }catch(error){
    res.status(500).json({message:"Server error during moderation", error: error.message })
  }
}


export const addThreadReply = async (req, res)=> {
  try{
    const {content, isFlagged} = req.body
    if(!content) return  res.status(400).json({message: "Reply content can not be empty"})
    
    const thread = await Forum.findById(req.params.id)
    if(!thread) return res.status(404).json({message:"Thread not found"})  

    const newReply = {author: req.user._id, content, isHidden: isFlagged || false} 
    thread.replies.push(newReply) 
    thread.repliesCount = thread.replies.length
    await thread.save()

    const updatedThread  = await Forum.findById(thread._id).populate("replies.author", "name avatar")
    const savedReply = updatedThread.replies.at(-1);
 
    const io = req.app.get("socketio")
   
    if (isFlagged) {
      await Notification.create({
        recipient: req.user._id,
        type: "GENERAL",
        message: "Your recent reply is under review by moderators to ensure community safety"
      })
      io.to("mod_room").emit("new_flagged_content", {
        message: "AI flagged a new reply for review",
        threadID: thread._id,
        replyID: savedReply._id
      })
      return res.status(202).json({
        success: true,
        message: "Your reply contains flagged keywords and has been sent for moderator review.",
        underReview: true
      })
    }

    io.emit("new_reply", {threadId: thread._id, reply: savedReply, repliesCount: thread.repliesCount})
   
    res.status(201).json({success: true , reply: savedReply})

  }catch(error){
    res.status(500).json({message: "Server error adding reply", error: error.message}) 
  }
}

export const updateThreadReply = async (req, res)=>{
  try{
    const {content, isFlagged} = req.body
    const thread = await Forum.findById(req.params.threadId)
    if(!thread) return res.status(404).json({message:"Thread not found"})

    const reply = thread.replies.id(req.params.replyId)
    if(!reply) return res.status(404).json({message:"Reply not found"})

    if(reply.author.toString() !== req.user._id.toString()){
      return res.status(403).json({message:"Not authorized to edit this"})
    }  

    reply.content= content || reply.content 
    reply.isHidden = isFlagged || false
    await thread.save()

    const io = req.app.get("socketio")
    
    if (isFlagged) {
      await Notification.create({
        recipient: req.user._id,
        type: "GENERAL",
        message: "Your updated reply is under review by moderators to ensure community safety"
      })
      io.to("mod_room").emit("new_flagged_content", {
        message: "AI flagged an updated reply for review",
        threadID: thread._id,
        replyID: reply._id
      })
      return res.status(202).json({
        success: true,
        message: "Your reply contains flagged keywords and has been sent for moderator review.",
        underReview: true
      })
    }

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
};

export const getForumThreadById = async (req, res) => {
  try {
    const thread = await Forum.findById(req.params.id)
      .populate("author", "name avatar")
      .populate("replies.author", "name avatar");

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    res.status(200).json({
      success: true,
      thread
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch thread details",
      error: error.message
    });
  }
};