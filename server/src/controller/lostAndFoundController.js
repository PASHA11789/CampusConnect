import LostFound from "../models/lostFound.js";
import Notification from "../models/Notification.js"

export const getLostFoundItems = async (req, res)=>{
    try{

        const query = {
            isHidden : false,
            $or: [
                { status : { $in: ["Open", "At Office"] } },
                { reporter: req.user._id }
            ]
        }

        const items = await LostFound.find(query)
        .populate("reporter", "name avatar registeration_number")
        .populate("foundBy", "name avatar registeration_number")
        .sort({ createdAt: -1})

        res.status(200).json({success: true, count: items.length, items})
    }catch(error){
        res.status(500).json({message: "Failed to fetch items", error: error.message})
    }
}

export const reportItem = async (req, res) =>{
    try{
        const {type , itemName , description, location, surrenderedAt, isFlagged } = req.body

        if(!type || !itemName || !description || !location){
            return res.status(400).json({message: "Please provide all required fields"})
        }

        let initialStatus = type === "LOST"? "Open":"At Office"
        
        const imageUrl = req.file && req.file.path ? req.file.path: ""

        const newItem = await LostFound.create({
            type,
            itemName,
            description,
            location,
            surrenderedAt: type === "FOUND"? surrenderedAt : "",
            reporter: req.user._id,
            image: imageUrl,
            status: initialStatus,
            isHidden: isFlagged || false 
        })  
        const populatedItem = await LostFound.findById(newItem._id)
        .populate("reporter", "name avatar")

        const io = req.app.get("socketio")

        if(isFlagged){
            const warningNotification = await Notification.create({
                recipient: req.user._id,
                type: "GENERAL",
                message:"Your Lost & Found is under review by moderators due to flagged keywords."
            })
            io.to(req.user._id.toString()).emit("new_notification",warningNotification)
        
            io.to("mod_room").emit("new_flagged_content",{
                message: "AI flagged a new Lost & Found post",
                itemId: newItem._id
            })
            return res.status(202).json({
                success: true,
                message: "Post sent for safety review",
                underReview: true
            })
        }

        io.emit("new_lost_found_item", populatedItem)

        return res.status(201).json({
            success: true,
            message: "Item reported successfully",
            item: populatedItem
        })
    }catch(error){
        res.status(500).json({
            message:"Failed to report item",
            error: error.message
        })
    }
}

export const resolveItem = async (req, res)=>{

    try{
        const item = await LostFound.findById(req.params.id)

        if(!item) return res.status(404).json({
            message:"Item not found"
        })
        item.status = "Returned"
        await item.save()

        const io = req.app.get("socketio")

        if(item.type === "FOUND"){
            const heroNotif = await Notification.create({

                recipient: item.reporter,
                type:"GENERAL",
                message:`Great news! The owner retrieved the ${item.itemName} you dropped off at ${item.surrenderedAt}. Thank you for helping the community!`
            })
            io.to(item.reporter.toString()).emit("new_notification", heroNotif) 
       }
       io.emit("item_resolved", {itemId: item._id, status: "Returned"} )
       res.status(200).json({success: true, message: "Glad you got your item back! Ticket closed."})
    }catch(error){
        res.status(500).json({message:"Server error resolving item", error: error.message})
    }

}

export const deleteItem = async (req, res) =>{
    try{
        if(req.user.role !== "admin" && req.user.role !== "student_mod"){
            return res.status(403).json({message: "Not authorized to delete items"})
        } 

        const item = await LostFound.findById(req.params.id)

        if(!item) return res.status(404).json({message:"Item not found"})
            
        await item.deleteOne()  
        const io = req.app.get("socketio")
        io.emit("item_deleted", {
            itemId: req.params.id
        })  
        res.status(200).json({success:true, message:"Item permanently removed from the system."})
        }catch(error){
     res.status(500).json({ message: "Server error deleting item", error: error.message });
         }
}

export const claimFoundItem = async (req, res) => {
    try {
        const { foundLocation, submittedTo } = req.body;
        if (!foundLocation || !submittedTo) {
            return res.status(400).json({ message: "Please provide where you found the item and to whom you submitted it." });
        }

        const item = await LostFound.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (item.type !== "LOST") {
            return res.status(400).json({ message: "Only lost items can be reported as found." });
        }

        if (item.status === "Claimed" || item.status === "Returned") {
            return res.status(400).json({ message: "This item has already been resolved or claimed." });
        }

        item.status = "Claimed";
        item.foundBy = req.user._id;
        item.foundLocation = foundLocation;
        item.submittedTo = submittedTo;
        item.foundAt = new Date();
        await item.save();

        const populatedItem = await LostFound.findById(item._id)
            .populate("reporter", "name avatar")
            .populate("foundBy", "name avatar registeration_number");

        const io = req.app.get("socketio");

        // Notify the owner (reporter)
        const notificationMessage = `Great news! ${req.user.name} reported they found your lost item "${item.itemName}" at ${foundLocation} and submitted it to ${submittedTo}.`;
        
        const ownerNotification = await Notification.create({
            recipient: item.reporter,
            type: "GENERAL",
            message: notificationMessage
        });

        io.to(item.reporter.toString()).emit("new_notification", ownerNotification);
        io.emit("item_resolved", { itemId: item._id, status: "Claimed", item: populatedItem });

        res.status(200).json({
            success: true,
            message: "Misplaced item report updated. The owner has been notified!",
            item: populatedItem
        });
    } catch (error) {
        res.status(500).json({ message: "Server error reporting found item", error: error.message });
    }
};