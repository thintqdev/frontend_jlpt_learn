// app/api/tts/route.ts (Next.js 13+ app router)
import { NextRequest } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_API_KEY,
});

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const voiceId = "JBFqnCBsd6RMkjVDRZzb";

  try {
    const audioStream = await elevenlabs.textToSpeech.stream(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
    });

    // Chuyển ReadableStream thành Buffer để trả về cho client
    const reader = audioStream.getReader();
    const chunks = [];
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      if (value) chunks.push(value);
      done = doneReading;
    }
    const audioBuffer = Buffer.concat(chunks);

    return new Response(audioBuffer, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
