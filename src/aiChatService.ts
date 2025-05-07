
export async function getAIResponse(prompt: string): Promise<string> {
  try {
    // Check if API key exists
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.error("OpenAI API key is missing. Check your environment variables.");
      return "I'm sorry, but I'm unable to respond right now due to a configuration issue. Please contact support.";
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: `You are an Islamic travel and finance assistant for the Companions Pay platform. Your role is to guide users respectfully through Hajj and Umrah planning, savings tips, redemption options, and Islamic finance concepts like zakat, halal investing, and pilgrimage budgeting.

Always prioritize accuracy, Shariah-compliant principles, and empathy in your answers. Keep your tone warm, concise, and motivating—like a trusted companion on their spiritual journey. If asked about pricing, savings balances, or redemption eligibility, explain how the platform works clearly. If you don't know something, say so respectfully.` 
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in AI response service:", error);
    return "I apologize, but I encountered an error processing your request. Please try again later.";
  }
}
