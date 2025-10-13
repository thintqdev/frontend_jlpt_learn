import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { grammar, settings } = await request.json();

    const prompt = `
Bạn là một giáo viên tiếng Nhật chuyên nghiệp. Hãy tạo ${
      settings.questionCount
    } câu hỏi luyện tập cho ngữ pháp sau:

**Ngữ pháp:** ${grammar.title}
**Định nghĩa:** ${grammar.definition}
**Trình độ:** ${grammar.level}

**Các cách dùng:**
${grammar.usages
  .map(
    (usage: any, index: number) => `
${index + 1}. **Cấu trúc:** ${usage.structure}
   **Ý nghĩa:** ${usage.meaning}
   **Ví dụ:**
   ${usage.examples
     .map((ex: any) => `   - ${ex.sentence} (${ex.translation})`)
     .join("\n")}
`
  )
  .join("\n")}

**Yêu cầu:**
- Tạo ${settings.questionCount} câu hỏi
- Loại câu hỏi: ${
      settings.questionType === "mixed"
        ? "Trộn lẫn trắc nghiệm, dịch Nhật→Việt và dịch Việt→Nhật"
        : settings.questionType === "multiple_choice"
        ? "Chỉ trắc nghiệm"
        : settings.questionType === "translation_jp_vn"
        ? "Chỉ dịch từ tiếng Nhật sang tiếng Việt"
        : "Chỉ dịch từ tiếng Việt sang tiếng Nhật"
    }
- Mức độ phù hợp với trình độ ${grammar.level}
- Câu hỏi đa dạng, tập trung vào cách sử dụng thực tế

**Định dạng trả về (JSON):**
{
  "questions": [
    {
      "type": "multiple_choice", // hoặc "translation_jp_vn" hoặc "translation_vn_jp"
      "question": "Câu hỏi ở đây",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], // chỉ có khi type = "multiple_choice"
      "correctAnswer": 0, // index của đáp án đúng (chỉ khi type = "multiple_choice")
      "correctTranslation": "Bản dịch đúng", // chỉ có khi type = "translation_jp_vn" hoặc "translation_vn_jp"
      "explanation": "Giải thích tại sao đây là đáp án đúng"
    }
  ]
}

**Lưu ý:**
- Với trắc nghiệm: Tạo 4 đáp án, 1 đúng 3 sai, đáp án sai phải hợp lý
- Với dịch Nhật→Việt (translation_jp_vn): Đưa câu tiếng Nhật, yêu cầu dịch sang tiếng Việt
- Với dịch Việt→Nhật (translation_vn_jp): Đưa câu tiếng Việt, yêu cầu dịch sang tiếng Nhật
- Câu hỏi phải sử dụng chính xác ngữ pháp đã cho
- Giải thích phải rõ ràng, dễ hiểu
- Khi tạo câu tiếng Nhật, sử dụng kanji và hiragana phù hợp với trình độ

Chỉ trả về JSON, không có text khác.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: {
        temperature: 0.7,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 4000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    try {
      // Remove any markdown formatting if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      const parsedContent = JSON.parse(cleanContent);
      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback: return sample questions
      return NextResponse.json({
        questions: [
          {
            type: "multiple_choice",
            question: `Câu nào sử dụng đúng ngữ pháp "${grammar.title}"?`,
            options: [
              "Câu A (mẫu)",
              "Câu B (mẫu)",
              "Câu C (mẫu)",
              "Câu D (mẫu)",
            ],
            correctAnswer: 0,
            explanation: "Đây là giải thích mẫu.",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error generating grammar practice:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
