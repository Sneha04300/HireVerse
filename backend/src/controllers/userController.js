const User = require("../models/user");

// Add XP
const addXP = async (req, res) => {
  try {
    const { xp } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.xp += xp;

    user.level = Math.floor(user.xp / 100) + 1;

    await user.save();

    res.status(200).json({
      message: "XP added successfully",
      xp: user.xp,
      level: user.level,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addXP,
};