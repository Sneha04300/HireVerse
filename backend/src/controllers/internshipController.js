const Internship = require("../models/Internship");

const seedInternships = async(req,res)=>{

try{

const userId = req.body.userId;

await Internship.insertMany([

{
userId,
company:"Google STEP",
role:"SWE Intern",
date:"Oct 04",
status:"Applied"
},

{
userId,
company:"Amazon SDE",
role:"SDE Intern",
date:"Oct 02",
status:"Interview"
},

{
userId,
company:"Microsoft Explore",
role:"SWE",
date:"Sep 28",
status:"OA"
},

{
userId,
company:"Atlassian",
role:"Frontend Intern",
date:"Sep 18",
status:"Rejected"
},

{
userId,
company:"Stripe",
role:"SWE Intern",
date:"Sep 12",
status:"Selected"
}

]);

res.status(201).json({
message:"Internships added"
});

}catch(error){

res.status(500).json({
message:error.message
});

}
};

const getInternships = async(req,res)=>{

try{

const internships = await Internship.find({
userId:req.params.userId
});

const applied = internships.length;

const interview = internships.filter(
i=>i.status==="Interview"
).length;

const selected = internships.filter(
i=>i.status==="Selected"
).length;

const rejected = internships.filter(
i=>i.status==="Rejected"
).length;

res.status(200).json({

applied,
interview,
selected,
rejected,

internships

});

}catch(error){

res.status(500).json({
message:error.message
});

}
};

module.exports = {
seedInternships,
getInternships
};