import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  generationConfig: {
    temperature: 0.4,
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 3000,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { title, level } = await request.json();

    if (!title || !level) {
      return NextResponse.json(
        { error: "title and level are required" },
        { status: 400 }
      );
    }

    const prompt = `Bạn là một giáo viên tiếng Nhật chuyên nghiệp với nhiều năm kinh nghiệm dạy JLPT. 

Hãy phân tích và tạo nội dung chi tiết cho điểm ngữ pháp: "${title}" (cấp độ ${level})

QUAN TRỌNG: Chỉ trả lời bằng JSON object duy nhất, không thêm bất kỳ text, giải thích hay markdown nào khác.

Trả lời CHÍNH XÁC theo format này:
{
  "definition": "Định nghĩa tổng quát của điểm ngữ pháp",
  "description": "Mô tả ngắn gọn cách sử dụng và ngữ cảnh",
  "usages": [
    {
      "structure": "Cấu trúc cụ thể 1",
      "meaning": "Ý nghĩa của cấu trúc này",
      "note": "Ghi chú về cách dùng (có thể để trống)",
      "examples": [
        {
          "sentence": "Câu ví dụ tiếng Nhật 1",
          "translation": "Bản dịch tiếng Việt 1"
        },
        {
          "sentence": "Câu ví dụ tiếng Nhật 2", 
          "translation": "Bản dịch tiếng Việt 2"
        }
      ]
    },
    {
      "structure": "Cấu trúc cụ thể 2 (nếu có)",
      "meaning": "Ý nghĩa của cấu trúc này",
      "note": "Ghi chú (nếu cần)",
      "examples": [
        {
          "sentence": "Câu ví dụ tiếng Nhật 3",
          "translation": "Bản dịch tiếng Việt 3"
        }
      ]
    }
  ]
}

Yêu cầu chi tiết:
- definition: Giải thích ngắn gọn, dễ hiểu ý nghĩa chính của điểm ngữ pháp
- description: Mô tả ngắn gọn hơn về cách sử dụng, ngữ cảnh, tình huống dùng
- usages: Mảng các cách dùng khác nhau của điểm ngữ pháp (1-3 cách dùng)
- Mỗi usage phải có:
  + structure: Cấu trúc ngữ pháp cụ thể (ví dụ: "Vている", "Nは〜です")
  + meaning: Ý nghĩa cụ thể của cấu trúc đó
  + note: Ghi chú về cách dùng, hạn chế, hoặc lưu ý đặc biệt (có thể để trống "")
  + examples: Mảng 2-3 ví dụ minh họa
- Mỗi example phải có:
  + sentence: Câu tiếng Nhật sử dụng đúng ngữ pháp, phù hợp cấp độ ${level}
  + translation: Bản dịch tiếng Việt tự nhiên, dễ hiểu
- Tất cả ví dụ phải thực tế, phù hợp với trình độ ${level}
- Sử dụng kanji và hiragana phù hợp với cấp độ
- Câu ví dụ nên đa dạng về chủ đề và ngữ cảnh

CHỈ trả về JSON object, không có text hay markdown nào khác.`;

    const fullPrompt = `Bạn là chuyên gia tiếng Nhật với chuyên môn sâu về JLPT và giảng dạy ngữ pháp tiếng Nhật cho người Việt. Bạn hiểu rõ đặc điểm của từng cấp độ JLPT và cách trình bày ngữ pháp một cách dễ hiểu. Luôn trả lời bằng JSON hợp lệ.

${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text().trim();

    if (!responseText) {
      throw new Error("No response from AI");
    }

    return await parseGrammarResponse(responseText, title, level);
  } catch (error) {
    console.error("Error generating grammar:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function parseGrammarResponse(
  responseText: string,
  title: string,
  level: string
) {
  try {
    let jsonText = responseText;

    // Remove markdown code blocks
    jsonText = jsonText.replace(/```json\s*\n/g, "").replace(/```\s*$/g, "");
    jsonText = jsonText.replace(/```\s*\n/g, "").replace(/```\s*$/g, "");

    // Try to find JSON object between { and }
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    jsonText = jsonText.trim();

    const grammarData = JSON.parse(jsonText);

    // Validate required fields
    const requiredFields = ["definition", "usages"];
    const missingFields = requiredFields.filter((field) => !grammarData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Validate usages array
    if (!Array.isArray(grammarData.usages) || grammarData.usages.length === 0) {
      throw new Error("Usages must be a non-empty array");
    }

    // Validate each usage
    grammarData.usages.forEach((usage: any, index: number) => {
      if (!usage.structure || !usage.meaning) {
        throw new Error(`Usage ${index + 1} missing structure or meaning`);
      }
      if (!Array.isArray(usage.examples) || usage.examples.length === 0) {
        throw new Error(`Usage ${index + 1} must have examples`);
      }
      usage.examples.forEach((example: any, exIndex: number) => {
        if (!example.sentence || !example.translation) {
          throw new Error(
            `Usage ${index + 1}, example ${
              exIndex + 1
            } missing sentence or translation`
          );
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        title,
        level,
        definition: grammarData.definition,
        description: grammarData.description || "",
        usages: grammarData.usages,
      },
    });
  } catch (parseError) {
    console.error("Failed to parse grammar response:", responseText);
    console.error("Parse error:", parseError);

    // Return fallback data
    return NextResponse.json({
      success: true,
      data: {
        title,
        level,
        definition: `Định nghĩa cho ${title}`,
        description: `Mô tả ngắn gọn về cách sử dụng ${title}`,
        usages: [
          {
            structure: title,
            meaning: `Ý nghĩa của ${title}`,
            note: "",
            examples: [
              {
                sentence: `Ví dụ sử dụng ${title}`,
                translation: "Bản dịch ví dụ",
              },
            ],
          },
        ],
      },
    });
  }
}
