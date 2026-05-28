import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export const aiModeration = async (req, res, next) => {
    try {
        const textToAnalyze = req.body.content || req.body.description

        if (!textToAnalyze) {
            req.body.isFlagged = false
            return next()
        }
        
        const systemPrompt = `You are an automated community moderator for a university student portal. 
    Analyze the following text for obscenity, severe toxicity, hate speech, or explicit content. 
    Ignore standard campus slang or mild complaints. 
    Respond ONLY with a valid JSON object in this format: {"isObscene": true|false, "reason": "brief explanation"}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nText to analyze: ${textToAnalyze}`,
            config: {
                responseMimeType: "application/json"
            }
        })

        const result = JSON.parse(response.text)
        req.body.isFlagged = result.isObscene;
        req.body.flagReason = result.reason;

        next()
    } catch (error) {
        console.error("AI moderation Error: ", error)
        req.body.isFlagged = false
        next()
    }
}