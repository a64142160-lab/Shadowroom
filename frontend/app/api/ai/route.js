import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a chill, intelligent AI assistant inside ShadowRoom. Keep responses conversational and helpful.'
        },
        ...(messages || [])
      ]
    });

    return Response.json({ reply: completion.choices?.[0]?.message?.content || 'No response' });
  } catch {
    return Response.json({ reply: 'The AI tunnel is unstable right now. Try again in a moment.' }, { status: 500 });
  }
}
