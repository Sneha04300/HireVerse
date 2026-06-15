const WeeklyPlan = require("../models/WeeklyPlan");

const createWeeklyPlan = async(req,res)=>{

try{

const plan = await WeeklyPlan.create({

userId:req.body.userId,

progress:65,

tasks:[

{
day:"MON",
task:"Solve 3 DP Questions",
category:"DSA",
completed:true
},

{
day:"TUE",
task:"Resume Optimization",
category:"Resume",
completed:true
},

{
day:"WED",
task:"Mock Interview - Technical",
category:"Interview",
completed:true
},

{
day:"THU",
task:"Graph Problems (5 mediums)",
category:"DSA"
},

{
day:"FRI",
task:"GitHub README improvements",
category:"GitHub"
},

{
day:"SAT",
task:"Behavioral prep - 5 stories",
category:"HR"
},

{
day:"SUN",
task:"Weekly retro + plan next week",
category:"Plan"
}

]

});

res.status(201).json(plan);

}catch(error){

res.status(500).json({
message:error.message
})

}

};

const getWeeklyPlan = async(req,res)=>{

try{

const plan = await WeeklyPlan.findOne({
userId:req.params.userId
});

if(!plan){
return res.status(404).json({
message:"Plan not found"
});
}

res.status(200).json(plan);

}catch(error){

res.status(500).json({
message:error.message
})

}

};

module.exports = {
createWeeklyPlan,
getWeeklyPlan
};