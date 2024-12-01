const errorMiddleware=(err,req,res,next)=>{
    err.message=err.message||"Internal Server Error"
    err.statusCode=err.statusCode||500
    res.status(err.statusCode).json({
        message:err.message
    })
};
const TryCatch=(fn)=>async(req,res,next)=>{
    try {
        await fn(req,res,next)
    }catch (error) {
        next(error)
    }
}

export {errorMiddleware,TryCatch}