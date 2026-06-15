const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    company:String,

    role:String,

    date:String,

    status:{
        type:String,
        enum:["Applied","OA","Interview","Rejected","Selected"]
    }
},
{
    timestamps:true
}
);

module.exports = mongoose.model("Internship", internshipSchema);