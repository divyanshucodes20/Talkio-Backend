import { body,validationResult,check,param, query } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";


const registerValidator=()=>[
    body("name","Please Enter Name").notEmpty(),
    body("bio","Please Enter Bio").notEmpty(),
    body("username","Please Enter Username").notEmpty(),
    body("password","Please Enter Password").notEmpty(),
    check("avatar","Please Upload Photo").notEmpty()
];

const loginValidator=()=>[
    body("username","Please Enter Username").notEmpty(),
    body("password","Please Enter Password").notEmpty(),
];

const newGroupValidator=()=>[
    body("name","Please Enter Name").notEmpty(),
    body("members").notEmpty()
    .withMessage("Please Add Members")
    .isArray({min:2,max:50})
    .withMessage("Add 2-50 Members"),
];

const addMemberValidator=()=>[
    body("chatId","Please Enter ChatId").notEmpty(),
    body("members").notEmpty()
    .withMessage("Please Add Members")
    .isArray({min:1,max:47})
    .withMessage("Add 1-47 Members"),
];

const removeMemberValidator=()=>[
    body("chatId","Please Enter ChatId").notEmpty(),
    body("userId","Please Select User to Remove").notEmpty()
];

const leaveGroupValidator=()=>[
    param("id","Please Enter ChatId").notEmpty()
];

const sendAttachmentsValidator=()=>[
    body("chatId","Please Enter ChatId").notEmpty(),
    check("files").notEmpty()
    .withMessage("Please Upload Attachments")
    .isArray({min:1,max:5})
    .withMessage("Add 1-5 Members"),
];

const getMessagesValidator=()=>[
    param("id","Please Enter Chat ID").notEmpty(),
]

const renameGroupValidator=()=>[
    param("id","Please Enter Chat ID").notEmpty(),
    body("name","Please Enter New Name").notEmpty()
]
const sendRequestValidator=()=>[
    body("userId","Please Enter UserId").notEmpty()
]

const acceptRequestValidator=()=>[
    body("requestId","Please Enter RequestId").notEmpty(),
    body("accept").notEmpty()
    .withMessage("Please Add Acception")
    .isBoolean()
    .withMessage("Acception must be a boolean"),
]

const validateHandler=(req,res,next)=>{
const errors=validationResult(req);

const errorMessages=errors.array().map((error)=>error.msg).join(",");
if(errors.isEmpty()){
    return next();
}
else{
    next(new ErrorHandler(errorMessages,400));
}

}

export {registerValidator,validateHandler,loginValidator,newGroupValidator,addMemberValidator,removeMemberValidator,leaveGroupValidator,sendAttachmentsValidator,getMessagesValidator,renameGroupValidator,sendRequestValidator,acceptRequestValidator};