import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import logger from "../utils/logger.utils";
import { safeVertexAi } from "../config/gcp";

export const getDiagnosisSuggestions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { symptoms, vitals, patientHistory } = req.body;

    if (!safeVertexAi) {
      return res.status(500).json({
        status: "error",
        message: "Vertex AI not configured",
      });
    }

    // Construct prompt for Gemini Flash
    const prompt = `
      You are a medical AI assistant.
      Given the following patient data, provide possible diagnoses and recommendations.
      Symptoms: ${symptoms}
      Vitals: ${JSON.stringify(vitals)}
      Patient History: ${JSON.stringify(patientHistory)}
      Provide your response as JSON with "diagnoses" and "recommendations" fields.
    `;

    // Call Vertex AI text generation
    const response = await safeVertexAi.predict({
      model: "geminiflash-3.5", // specify the model
      input: prompt,
      temperature: 0.3,
      maxOutputTokens: 500,
    });

    // The predicted text is usually in response.outputText or similar field
    const suggestions = response?.outputText || "No suggestions";

    res.json({
      status: "success",
      data: suggestions,
    });
  } catch (error: any) {
    logger.error("AI diagnosis error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get diagnosis suggestions",
    });
  }
};
