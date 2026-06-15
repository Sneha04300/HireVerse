const mongoose = require("mongoose");

const weeklyPlanSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    progress:{
        type:Number,
        default:65
    },

    tasks:[
        {
            day:String,
            task:String,
            category:String,
            completed:{
                type:Boolean,
                default:false
            }
        }
    ]
},
{
    timestamps:true
}
);

module.exports = mongoose.model("WeeklyPlan", weeklyPlanSchema);