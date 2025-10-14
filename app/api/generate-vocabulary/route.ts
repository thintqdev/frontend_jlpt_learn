import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  generationConfig: {
    temperature: 0.3, // Giảm nhiệt độ để có response ổn định hơn
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 2000, // Tăng output để gen nhiều từ
  },
});

export async function POST(request: NextRequest) {
  try {
    const { word, wordType, level, count, topic, existingWords } =
      await request.json();

    // Case 1: Analyze single word
    if (word) {
      const prompt = `Phân tích từ tiếng Nhật này: "${word}"

QUAN TRỌNG: Chỉ trả lời bằng JSON object duy nhất, không thêm bất kỳ text, giải thích hay markdown nào khác.

Trả lời CHÍNH XÁC theo format này:
{"hiragana":"cách đọc","meanings":[{"meaning":"nghĩa 1","example":"ví dụ 1","translation":"dịch ví dụ 1"},{"meaning":"nghĩa 2","example":"ví dụ 2","translation":"dịch ví dụ 2"}],"type":"loại từ"}

Yêu cầu:
- hiragana: Viết bằng hiragana/katakana, không romaji
- meanings: Array các object, mỗi object gồm:
  + meaning: Một nghĩa tiếng Việt cụ thể
  + example: Câu ví dụ gồm 1 câu tiếng Nhật sử dụng từ này với nghĩa đó
  + translation: Dịch tiếng Việt của câu ví dụ
- type: Loại từ (noun, verb, adjective, adverb, particle, hoặc expression)
- Cung cấp 1-3 nghĩa phổ biến nhất nhưng phải khác nhau hoàn toàn chứ không cần giống nhau với ví dụ cụ thể cho mỗi nghĩa

CHỈ trả về JSON object, không có text hay markdown nào khác.`;

      const fullPrompt = `Bạn là chuyên gia tiếng Nhật chuyên phân tích từ vựng cho người Việt học tiếng Nhật. Bạn có kiến thức sâu về JLPT, ngữ pháp, và cách sử dụng từ vựng trong ngữ cảnh thực tế. Luôn trả lời bằng JSON hợp lệ.

${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = response.text().trim();

      if (!responseText) {
        throw new Error("No response from Gemini");
      }

      return await parseSingleWordResponse(responseText);
    }

    // Case 2: Generate multiple words by topic
    if (!wordType || !level || !count) {
      return NextResponse.json(
        { error: "wordType, level, and count are required" },
        { status: 400 }
      );
    }

    const topicText = topic ? ` về chủ đề "${topic}"` : "";
    const existingWordsText =
      existingWords && existingWords.length > 0
        ? `\n\nQUAN TRỌNG: KHÔNG tạo các từ sau đây vì đã có trong database:\n${existingWords.join(
            ", "
          )}`
        : "";

    const wordTypeMap: { [key: string]: string } = {
      noun: "danh từ (名詞)",
      verb: "động từ (動詞)",
      adjective: "tính từ (形容詞)",
      adverb: "phó từ (副詞)",
      conjunction: "liên từ (接続詞)",
      interjection: "thán từ (感動詞)",
    };

    const batchPrompt = `Tạo ${count} từ vựng tiếng Nhật là ${
      wordTypeMap[wordType] || wordType
    } cấp độ ${level}${topicText}.${existingWordsText}

QUAN TRỌNG: Chỉ trả lời bằng JSON array, không thêm bất kỳ text, giải thích hay markdown nào khác.

Trả lời CHÍNH XÁC theo format này (JSON array):
[{"word":"từ kanji 1","reading":"cách đọc hiragana","meanings":[{"meaning":"nghĩa 1","example":"ví dụ 1","translation":"dịch 1"}],"type":"${wordType}","level":"${level}"},{"word":"từ kanji 2","reading":"cách đọc","meanings":[{"meaning":"nghĩa 2","example":"ví dụ 2","translation":"dịch 2"}],"type":"${wordType}","level":"${level}"}]

Yêu cầu:
- Tạo CHÍNH XÁC ${count} từ vựng khác nhau
- Mỗi từ phải có ít nhất 1 nghĩa với ví dụ và bản dịch
- reading: Viết bằng hiragana/katakana, không romaji
- word: Viết bằng Kanji (nếu có) hoặc Kana
- meanings: Array các object, mỗi object gồm meaning (tiếng Việt), example (câu tiếng Nhật), translation (dịch câu)
- type: "${wordType}"
- level: "${level}"
${existingWordsText ? "- TUYỆT ĐỐI KHÔNG tạo các từ đã liệt kê ở trên" : ""}
${topicText ? `- Tất cả từ phải liên quan đến chủ đề${topicText}` : ""}

CHỈ trả về JSON array, không có text hay markdown nào khác.`;

    const fullBatchPrompt = `Bạn là chuyên gia tiếng Nhật chuyên tạo từ vựng cho người Việt học tiếng Nhật. Bạn có kiến thức sâu về JLPT, ngữ pháp, và cách sử dụng từ vựng trong ngữ cảnh thực tế. Luôn trả lời bằng JSON hợp lệ.

${batchPrompt}`;

    const result = await model.generateContent(fullBatchPrompt);
    const response = await result.response;
    const responseText = response.text().trim();

    if (!responseText) {
      throw new Error("No response from Gemini");
    }

    return await parseBatchWordsResponse(responseText, count, wordType, level);
  } catch (error) {
    console.error("Error generating vocabulary:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function parseSingleWordResponse(responseText: string) {
  try {
    let vocabularyData;
    // First try direct parsing
    vocabularyData = JSON.parse(responseText);

    // Validate required fields
    const requiredFields = ["hiragana", "meanings", "type"];
    const missingFields = requiredFields.filter(
      (field) => !vocabularyData[field]
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Validate meanings array
    if (
      !Array.isArray(vocabularyData.meanings) ||
      vocabularyData.meanings.length === 0
    ) {
      throw new Error("Meanings must be a non-empty array");
    }

    return NextResponse.json({
      success: true,
      data: vocabularyData,
    });
  } catch (parseError) {
    console.error("Failed to parse single word response:", responseText);
    throw new Error("Could not parse vocabulary data from AI response");
  }
}

async function parseBatchWordsResponse(
  responseText: string,
  expectedCount: number,
  wordType: string,
  level: string
) {
  try {
    let jsonText = responseText;

    // Remove markdown code blocks
    jsonText = jsonText.replace(/```json\s*\n/g, "").replace(/```\s*$/g, "");
    jsonText = jsonText.replace(/```\s*\n/g, "").replace(/```\s*$/g, "");

    // Try to find JSON array between [ and ]
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    jsonText = jsonText.trim();

    const wordsData = JSON.parse(jsonText);

    if (!Array.isArray(wordsData)) {
      throw new Error("Response is not an array");
    }

    if (wordsData.length === 0) {
      throw new Error("No words generated");
    }

    // Validate each word
    const validWords = wordsData.filter((word) => {
      return (
        word.word &&
        word.reading &&
        Array.isArray(word.meanings) &&
        word.meanings.length > 0
      );
    });

    if (validWords.length === 0) {
      throw new Error("No valid words in response");
    }

    return NextResponse.json({
      success: true,
      words: validWords,
    });
  } catch (parseError) {
    console.error("Failed to parse batch words response:", responseText);
    throw new Error("Could not parse vocabulary batch from AI response");
  }
}
