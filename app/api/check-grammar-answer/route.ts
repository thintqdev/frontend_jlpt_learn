import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, grammar } = await request.json();

    let prompt = "";

    if (question.type === "multiple_choice") {
      const selectedOption = question.options[userAnswer];
      const correctOption = question.options[question.correctAnswer];

      prompt = `
Bạn là giáo viên tiếng Nhật. Hãy chấm điểm và đưa ra phản hồi cho câu trả lời của học sinh.

**Ngữ pháp:** ${grammar.title} - ${grammar.definition}

**Câu hỏi:** ${question.question}

**Các đáp án:**
${question.options
  .map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`)
  .join("\n")}

**Đáp án đúng:** ${String.fromCharCode(
        65 + question.correctAnswer
      )}. ${correctOption}
**Học sinh chọn:** ${String.fromCharCode(65 + userAnswer)}. ${selectedOption}

Hãy đánh giá và đưa ra phản hồi bằng tiếng Việt trong format JSON:
{
  "isCorrect": true/false,
  "explanation": "Giải thích chi tiết tại sao đúng/sai, bao gồm cách dùng ngữ pháp"
}
`;
    } else {
      const isJapaneseToVietnamese = question.type === "translation_jp_vn";
      prompt = `
Bạn là giáo viên tiếng Nhật. Hãy chấm điểm bản dịch của học sinh.

**Ngữ pháp:** ${grammar.title} - ${grammar.definition}

**Loại bài tập:** ${
        isJapaneseToVietnamese
          ? "Dịch từ tiếng Nhật sang tiếng Việt"
          : "Dịch từ tiếng Việt sang tiếng Nhật"
      }
**Câu gốc:** ${question.question}
**Bản dịch đúng:** ${question.correctTranslation}
**Bản dịch của học sinh:** ${userAnswer}

Hãy đánh giá bản dịch của học sinh (có thể chấp nhận các cách diễn đạt khác nhau miễn là ý nghĩa đúng và ngữ pháp chính xác) và đưa ra phản hồi bằng tiếng Việt trong format JSON:
{
  "isCorrect": true/false,
  "explanation": "Nhận xét chi tiết về bản dịch, chỉ ra điểm đúng/sai và cách cải thiện. ${
    isJapaneseToVietnamese
      ? "Đánh giá xem ý nghĩa có chính xác không."
      : "Đánh giá xem ngữ pháp và từ vựng tiếng Nhật có đúng không."
  }"
}
`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: {
        temperature: 0.3,
        topK: 10,
        topP: 0.8,
        maxOutputTokens: 1000,
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

      // Fallback logic for multiple choice
      if (question.type === "multiple_choice") {
        const isCorrect = userAnswer === question.correctAnswer;
        return NextResponse.json({
          isCorrect,
          explanation: isCorrect
            ? "Chính xác! Bạn đã chọn đúng đáp án."
            : `Chưa chính xác. Đáp án đúng là: ${
                question.options[question.correctAnswer]
              }`,
        });
      } else {
        // Simple text comparison for translation
        const similarity =
          userAnswer.toLowerCase().trim() ===
          question.correctTranslation?.toLowerCase().trim();
        const isJapaneseToVietnamese = question.type === "translation_jp_vn";
        return NextResponse.json({
          isCorrect: similarity,
          explanation: similarity
            ? `Bản dịch ${
                isJapaneseToVietnamese ? "tiếng Việt" : "tiếng Nhật"
              } chính xác!`
            : `Bản dịch chưa chính xác. Đáp án tham khảo: "${question.correctTranslation}"`,
        });
      }
    }
  } catch (error) {
    console.error("Error checking answer:", error);
    return NextResponse.json(
      {
        isCorrect: false,
        explanation: "Không thể kiểm tra câu trả lời. Vui lòng thử lại.",
      },
      { status: 500 }
    );
  }
}
