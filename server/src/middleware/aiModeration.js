import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export const aiModeration = async (req, res, next) => {
    try {
        const textToAnalyze = [req.body.title, req.body.content, req.body.description]
            .filter(Boolean)
            .join("\n");

        if (!textToAnalyze.trim()) {
            req.body.isFlagged = false
            return next()
        }
        
        const systemPrompt = `You are an automated community moderator for a university student portal. 
    Analyze the following text for obscenity, severe toxicity, hate speech, or explicit content. 
    The text can be in any language, most notably English, Urdu (in Arabic script), or Roman Urdu (Urdu written using the English/Latin alphabet, such as abusive transliterations or Romanized Urdu slurs). 
    Ensure you detect profanity, abusive terms, and offensive slurs across all these languages, scripts, and transliterations. 
    Ignore standard campus slang, friendly banter, or mild complaints. 
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