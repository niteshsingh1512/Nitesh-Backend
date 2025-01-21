const assyncHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler)
        .catch((err)=>next(err))
    }
}



//------------Try Catch Method--------------

/*

const assyncHandler=(requestHandler)=>async(req,res,next)=>{
    try{
        await requestHandler(req,res,next)
    }catch(error){
        res.status(err.code || 500).json({
            success:false,
            message: err.message
        })
    }
}

*/


export {assyncHandler}