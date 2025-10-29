import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  generationConfig: {
    temperature: 0.5,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 4000,
  },
});

// Helper function to calculate number of lines based on duration
function getLineCount(duration: string): { min: number; max: number } {
  const match = duration.match(/(\d+)/);
  if (!match) return { min: 6, max: 10 };

  const minutes = parseInt(match[1]);
  if (minutes <= 3) return { min: 6, max: 10 };
  if (minutes <= 5) return { min: 8, max: 12 };
  if (minutes <= 10) return { min: 12, max: 16 };
  return { min: 16, max: 20 };
}

export async function POST(request: NextRequest) {
  try {
    const { title, level, category, duration } = await request.json();

    if (!title || !level || !category) {
      return NextResponse.json(
        { error: "title, level, and category are required" },
        { status: 400 }
      );
    }

    const { min, max } = getLineCount(duration);
    const lineCount = Math.floor(Math.random() * (max - min + 1)) + min;

    const prompt = `Bạn là một giáo viên tiếng Nhật chuyên nghiệp với nhiều năm kinh nghiệm dạy JLPT. 

Hãy tạo một đoạn hội thoại (kaiwa) giữa hai người (A và B) với chủ đề: "${title}" (Danh mục: "${category}", Cấp độ: ${level})

QUAN TRỌNG: Chỉ trả lời bằng JSON array duy nhất, không thêm bất kỳ text, giải thích hay markdown nào khác.

Trả lời CHÍNH XÁC theo format này:
[
  {
    "speaker": "A",
    "jp": "こんにちは。今日はいい天気ですね。",
    "romaji": "Konnichiha. Kyou wa ii tenki desu ne.",
    "vi": "Xin chào. Hôm nay thời tiết thật đẹp nhỉ?"
  },
  {
    "speaker": "B",
    "jp": "そうですね。どこへ行きますか？",
    "romaji": "Sou desu ne. Doko he iki masu ka?",
    "vi": "Đúng rồi. Bạn sắp đi đâu?"
  }
]

Yêu cầu chi tiết:
- Tạo khoảng ${lineCount} dòng hội thoại tự nhiên
- Các speaker xen kẽ giữa A và B
- Hội thoại phải thực tế, tự nhiên, phù hợp với chủ đề "${title}"
- Tất cả tiếng Nhật phải phù hợp cấp độ ${level}
- Mỗi dòng phải có:
  + speaker: "A" hoặc "B"
  + jp: Câu tiếng Nhật sử dụng kanji/hiragana phù hợp
  + romaji: Phiên âm romaji của câu Nhật
  + vi: Bản dịch tiếng Việt tự nhiên, dễ hiểu

QUAN TRỌNG VỀ THỂ NGÔN NGỮ:
- Xác định mối quan hệ giữa A và B dựa trên chủ đề:
  * Nếu là hội thoại với bạn bè, người quen, gia đình: SỬ DỤNG THỂ THÔNG THƯỜNG (thể ngắn, bỏ desu/masu)
  * Nếu là hội thoại với cấp trên, khách hàng, người lạ: SỬ DỤNG THỂ KÍNH NGỮ (thể masu/desu)
  * Nếu là hội thoại công việc: SỬ DỤNG THỂ KÍNH NGỮ với cấp trên, thể thông thường với đồng nghiệp
- Ví dụ thể thông thường: "今日は何するの？" thay vì "今日は何をしますか？"
- Ví dụ thể kính ngữ: "今日は何をしますか？" thay vì "今日は何するの？"
- Đảm bảo tính nhất quán trong toàn bộ hội thoại

- Hội thoại nên bao gồm các biểu hiện xã giao phổ biến
- Sử dụng ngôn ngữ tự nhiên, không quá trang trọng

CHỈ trả về JSON array, không có text hay markdown nào khác.`;

    const fullPrompt = `Bạn là chuyên gia tiếng Nhật với chuyên môn sâu về JLPT và giảng dạy tiếng Nhật cho người Việt. Bạn hiểu rõ đặc điểm của từng cấp độ JLPT và cách tạo hội thoại tự nhiên, thú vị. Luôn trả lời bằng JSON hợp lệ.

${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text().trim();

    if (!responseText) {
      throw new Error("No response from AI");
    }

    return await parseKaiwaResponse(
      responseText,
      title,
      level,
      category,
      duration
    );
  } catch (error) {
    console.error("Error generating kaiwa:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function parseKaiwaResponse(
  responseText: string,
  title: string,
  level: string,
  category: string,
  duration: string
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

    const conversationData = JSON.parse(jsonText);

    // Validate it's an array
    if (!Array.isArray(conversationData) || conversationData.length === 0) {
      throw new Error("Response must be a non-empty array");
    }

    // Validate each line
    conversationData.forEach((line: any, index: number) => {
      if (!line.speaker || !line.jp || !line.vi) {
        throw new Error(`Line ${index + 1} missing speaker, jp, or vi field`);
      }
      if (!["A", "B"].includes(line.speaker)) {
        throw new Error(`Line ${index + 1} speaker must be "A" or "B"`);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        title,
        level,
        category,
        duration,
        conversation: conversationData,
        lineCount: conversationData.length,
      },
    });
  } catch (parseError) {
    console.error("Failed to parse kaiwa response:", responseText);
    console.error("Parse error:", parseError);

    // Return fallback data
    const { min, max } = getLineCount(duration);
    const fallbackLineCount = Math.floor(Math.random() * (max - min + 1)) + min;

    const fallbackConversation = Array.from(
      { length: fallbackLineCount },
      (_, idx) => ({
        speaker: idx % 2 === 0 ? "A" : "B",
        jp: `これは例です。（${idx + 1}）`,
        romaji: `Kore wa rei desu. (${idx + 1})`,
        vi: `Đây là ví dụ. (${idx + 1})`,
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        title,
        level,
        category,
        duration,
        conversation: fallbackConversation,
        lineCount: fallbackConversation.length,
      },
    });
  }
}
