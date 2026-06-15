const Roadmap = require("../models/Roadmap");

const createRoadmap = async(req,res)=>{
try{

const roadmap = await Roadmap.create({

userId:req.body.userId,

targetRole:"Amazon SDE I",

currentSkills:["Java","React","Node"],

roadmap:[

{
month:1,
phase:"Foundations",
topics:["Arrays","Strings","Linked Lists","Recursion"]
},

{
month:2,
phase:"Structures",
topics:["Trees","Graphs","Heaps","Tries"]
},

{
month:3,
phase:"Advanced",
topics:["DP","System Design","Behavioral","Mock Rounds"]
}

]

});

res.status(201).json(roadmap);

}catch(error){

res.status(500).json({
message:error.message
})

}
};

const getRoadmap = async(req,res)=>{

try{

const roadmap = await Roadmap.findOne({
userId:req.params.userId
});

if(!roadmap){
return res.status(404).json({
message:"Roadmap not found"
});
}

res.status(200).json(roadmap);

}catch(error){

res.status(500).json({
message:error.message
})

}
};

module.exports={
createRoadmap,
getRoadmap
};