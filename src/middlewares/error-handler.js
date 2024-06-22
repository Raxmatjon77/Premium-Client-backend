module.exports= function(error,req,res,next){
    if (error.status < 500) {
      return res.status(error.status).json(error);
    } else {
      return next(error);
    }
}