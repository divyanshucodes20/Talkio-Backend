import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.model.js";
import { emitEvent } from "../utils/features.js";
import { ALERT, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMemberOfChat } from "../lib/helper.js";
import { User } from "../models/user.model.js";

const newGroupChat = TryCatch(
  async (req, res, next) => {
    const { name, members } = req.body;
    if (!name) return next(new ErrorHandler("Name is required", 400));
    if (members.length < 2) return next(new ErrorHandler("Group chat must have at least 2 members", 400));

    const allMembers = [...members, req.user];
    await Chat.create({
      name,
      groupChat: true,
      creator: req.user,
      members: allMembers,
    });
    emitEvent(req, ALERT, allMembers, `Welcome to ${name} Group`);
    emitEvent(req, REFETCH_CHATS, members);
    return res.status(201).json({
      success: true,
      message: "Group created successfully",
    });
  }
);

const getMyChats = TryCatch(
  async (req, res, next) => {
    const chats = await Chat.find({ members: req.user }).populate("members", "name avatar");
    const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
      const otherMemberOfChat = getOtherMemberOfChat(members, req.user);
      return {
        _id,
        name: groupChat ? name : otherMemberOfChat.name,
        members: members.reduce((prev, curr) => {
          if (curr._id.toString() !== req.user.toString()) prev.push(curr._id);
          return prev;
        }, []),
        groupChat,
        avatar: groupChat ? members.slice(0, 3).map(({ avatar }) => avatar.url) : [otherMemberOfChat.avatar.url],
      };
    });
    return res.status(200).json({
      success: true,
      chats: transformedChats,
    });
  }
);

const getMyGroups = TryCatch(
  async (req, res, next) => {
    const chats = await Chat.find({
      members: req.user,
      groupChat: true,
      creator: req.user,
    }).populate("members", "name avatar");
    const groups = chats.map(({ members, _id, groupChat, name }) => ({
      _id,
      groupChat,
      name,
      avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
    }));
    return res.status(200).json({
      success: true,
      groups,
    });
  }
);

const addMembers = TryCatch(
  async (req, res, next) => {
    const { chatId, members } = req.body;
    if (!members || members.length < 1) return next(new ErrorHandler("Please select members to add", 400));

    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandler("Chat not found", 404));
    if (!chat.groupChat) return next(new ErrorHandler("This is not a group chat", 400));
    if (chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("You are not allowed to add members", 403));

    const allNewMembersPromise = members.map((memberId) => User.findById(memberId, "name"));
    const allNewMembers = await Promise.all(allNewMembersPromise);

    const uniqueMembers = allNewMembers.filter((i) => !chat.members.includes(i._id.toString())).map((i) => i._id);

    chat.members.push(...uniqueMembers);
    if (chat.members.length > 50) return next(new ErrorHandler("Members limit reached", 400));
    await chat.save();
    const allUsersName = allNewMembers.map((i) => i.name).join(",");
    emitEvent(req, ALERT, chat.members, `${allUsersName} added to the group`);
    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
      success: true,
      message: "Members added successfully",
    });
  }
);

const removeMembers = TryCatch(
  async (req, res, next) => {
    const { userId, chatId } = req.body;
    if (!userId) return next(new ErrorHandler("Please select members to remove", 400));

    const [chat, userThatWillBeRemoved] = await Promise.all([
      Chat.findById(chatId),
      User.findById(userId, "name"),
    ]);
    if (!chat) return next(new ErrorHandler("Chat not found", 404));
    if (!chat.groupChat) return next(new ErrorHandler("This is not a group chat", 400));
    if (chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("You are not allowed to remove members", 403));
    if (chat.members.length <= 3) return next(new ErrorHandler("Group chat must have at least 3 members", 400));

    chat.members = chat.members.filter((i) => i.toString() !== userId);
    await chat.save();
    emitEvent(req, ALERT, chat.members, `${userThatWillBeRemoved.name} removed from the group`);
    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  }
);

const leaveGroup = TryCatch(
  async (req, res, next) => {
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId);
    if (!chat) return next(new ErrorHandler("Chat not found", 404));
    if (!chat.groupChat) return next(new ErrorHandler("This is not a group chat", 400));

    const remainingMembers = chat.members.filter((i) => i.toString() !== req.user.toString());

    if (remainingMembers.length < 3) return next(new ErrorHandler("Group chat must have at least 3 members", 400));


    if (chat.creator.toString() === req.user.toString()) {
      const randomNumber = Math.floor(Math.random() * remainingMembers.length);
      const newCreator = remainingMembers[randomNumber];
      chat.creator = newCreator;
    }
    chat.members = remainingMembers;
    const [user] = await Promise.all([User.findById(req.user, "name"), chat.save()]);
    emitEvent(req, ALERT, chat.members, `${user.name} left the group`);

    return res.status(200).json({
      success: true,
      message: "Group left successfully",
    });
  }
);
const sendAttachments=TryCatch(
    async(req,res,next)=>{
       const {chatId}=req.body;

       const [chat,user]=await Promise.all([
        Chat.findById(chatId),
        User.findById(req.user,"name")
       ]) 

         if(!chat) return next(new ErrorHandler("Chat not found", 404));

         const files=req.files || [];
         if(files.length<1) return next(new ErrorHandler("Please select files to send", 400));

         const attachments=[];
         const messageForRealtime={
                content:"",
                attachments,
                sender:{
                    _id:user._id,
                    name:user.name,
                },
                chatId,
         };
         const messageForDB={content:"",attachments,sender:user._id,chatId};
    }
)



export { newGroupChat, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup,sendAttachments };
