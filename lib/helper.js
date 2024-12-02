


const getOtherMemberOfChat=(members,userId)=>
 members.find((member)=>member._id.toString()!==userId.toString())

export {getOtherMemberOfChat}