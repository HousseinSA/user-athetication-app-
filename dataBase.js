const mongoose = require("mongoose")
const passpoortLocalMongoose = require("passport-local-mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/userDB")
const userShema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  secrets:[{
    secret:String,
    color:String
  }]
})
userShema.plugin(passpoortLocalMongoose)
module.exports = mongoose.model("user", userShema)
