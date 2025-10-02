import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 })
    }

    // Use Groq's vision model to analyze the disaster image
    const completion = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [
        {
          role: "user",
          content: `You are an emergency response AI system. Analyze this disaster image and provide:

1. A brief description of what you see (2-3 sentences)
2. The type of disaster (flood, fire, earthquake, building collapse, medical emergency, accident, etc.)
3. The severity level (low, medium, high, critical)
4. Which rescue team should be dispatched

Image URL: ${imageUrl}

Respond in this exact JSON format:
{
  "description": "Brief description of the scene",
  "disasterType": "type of disaster",
  "severity": "severity level",
  "assignedTeam": "team name",
  "reasoning": "Why this team was chosen"
}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    })


    const responseText = completion.choices[0]?.message?.content || ""

    // Extract JSON from the response
    let analysisData
    try {
      // Try to parse the entire response as JSON
      analysisData = JSON.parse(responseText)
    } catch {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[1])
      } else {
        // Last resort: try to find JSON object in the text
        const objectMatch = responseText.match(/\{[\s\S]*\}/)
        if (objectMatch) {
          analysisData = JSON.parse(objectMatch[0])
        } else {
          throw new Error("Could not parse AI response")
        }
      }
    }

    // Create a comprehensive analysis text
    const analysis = `${analysisData.description}\n\nDisaster Type: ${analysisData.disasterType}\nSeverity: ${analysisData.severity}\nReasoning: ${analysisData.reasoning}`

    return NextResponse.json({
      analysis,
      assignedTeam: analysisData.assignedTeam,
      disasterType: analysisData.disasterType,
      severity: analysisData.severity,
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
