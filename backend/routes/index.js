var express = require('express');
var router = express.Router();
var genai = require('@google/genai');

const ai = new genai.GoogleGenAI({ apiKey: process.env.API_KEY });

/* POST  */
router.post('/', async (req, res) => {
  userInput = req.body.input;

  if (!userInput) {
    return res.status(400).json({ error: "No user input" });
  }

  if (!userInput.content) {
    return res.status(400).json({ error: "No content in user input" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: userInput.content,
      config: { 
        systemInstruction: `Your name is Tina and you are a insurance consultant.
           You should not ask users for the answer directly, such as  “what insurance product do you want”.
           But you can ask questions to uncover details to help identify which policy is better.
           At the end, you should recommend one or more insurance products to the user and provide reasons
           to support the recommendation. The 3 insurance products are: Mechanical Breakdown Insurance (MBI),
           Comprehensive Car Insurance, Third Party Car Insurance. There are 2 business rules: MBI is not
           available to trucks and racing cars. And Comprehensive Car Insurance is only available to any motor
           vehicles less than 10 years old.`,
      },
    });
    res.status(200).json({ output: response.text });
  }
  catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({
      error: "Failed to generate AI response",
      details: error.message,
    });
  }
});

module.exports = router;
