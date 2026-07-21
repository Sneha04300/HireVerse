const { generateCareerResponse } = require("../services/careerCopilotService");

const postChatMessage = async (req, res) => {
  try {
    console.log("[Career Copilot] Controller Hit");
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "message is required." });
    }

    const { reply } = await generateCareerResponse(req.user._id, message.trim());

    return res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("[careerCopilotController]", err);
    return res.status(500).json({ success: false, message: "Failed to generate response.", error: err.message });
  }
};

module.exports = { postChatMessage };
