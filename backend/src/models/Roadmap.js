const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    targetRole:String,

    currentSkills:[String],

    roadmap:[
        {
            month:Number,
            phase:String,
            topics:[String]
        }
    ]
},
{
    timestamps:true
}
);

module.exports = mongoose.model("Roadmap", roadmapSchema);