const fs=require('fs')
const path=require('path')
module.exports = (error, req, res, next) => {
  fs.appendFileSync(
    path.join(process.cwd(), "error.log"),
    `${req.url}___${req.method}___${Date.now()}___${error.name}___${
      error.message
    }\n`
  );

  return res.status(500).json({
    status: 500,
    name: "InternalServerError",
    message: error.message.message ?? error.message,
  });
};
