require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.post("/generate-quiz", async (req, res) => {
  const { topic, difficulty, numberOfQuestions } = req.body;
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const prompt = `You are an expert quiz generator specializing in educational content. Your task is to create a well-structured, engaging, and informative quiz based on the following parameters:
Topic: ${topic}
Difficulty level: ${difficulty}
Number of questions: ${numberOfQuestions}
Please follow these guidelines:

Assess the topic:

Ensure the topic is educational and appropriate for quiz creation.
If the topic is not educational or suitable, respond with:
{"error": "Unfortunately, this topic does not meet the standards of educational content."}


Create the quiz:
If the topic is suitable, generate a quiz adhering to these criteria:
a. Title: Create a concise, relevant title that accurately reflects the quiz content.
b. Questions: Formulate clear, unambiguous questions that align with the specified difficulty level.
c. Options: Provide exactly 4 options (A, B, C, D) for each question.
d. Correct answer: Clearly indicate the correct option.
e. Explanation: Offer a brief, informative explanation for the correct answer.
Ensure variety:

Mix different types of questions (e.g., multiple-choice, true/false formatted as multiple-choice, fill-in-the-blank presented as multiple-choice).
Cover various aspects of the topic to provide a comprehensive assessment.


Maintain consistency:

Use a uniform style and formatting throughout the quiz.
Ensure all questions have only 4 options.


Tailor to difficulty level:

Adjust the complexity of questions, vocabulary, and concepts to match the specified difficulty level.


Verify accuracy:

Double-check all information for factual correctness.
Ensure there is only one unambiguously correct answer per question.


Output format:
Present the quiz in the following JSON format:
{
"title": "Title of the Quiz",
"quizzes": [
{
"question": "Question",
"options": ["Option A", "Option B", "Option C", "Option D"],
"correct_option": "Option A",
"explanation": "Explanation of the correct answer"
}
]
}
Final check:

Confirm that the number of questions matches ${numberOfQuestions}.
Verify that each question has exactly 4 options.
Ensure the JSON structure is valid and properly formatted.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonString = text.replace(/^```json\s*|```$/g, "");
    res.json(JSON.parse(jsonString));
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({
        error:
          "Sorry, the request can't be processed at this moment. Please try again.",
      });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
