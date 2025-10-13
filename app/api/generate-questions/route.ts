import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

interface GenerateRequest {
  count: number;
  level: "N1" | "N2" | "N3" | "N4" | "N5";
  type:
    | "KANJI_SELECTION"
    | "HIRAGANA"
    | "VOCABULARY"
    | "SYNONYMS_ANTONYMS"
    | "CONTEXTUAL_WORDS"
    | "GRAMMAR"
    | "JLPT_FORMAT";
}

function createPrompt(data: GenerateRequest): string {
  const { count, level, type } = data;

  const levelDescriptions = {
    N5: "cơ bản nhất, từ vựng và ngữ pháp đơn giản",
    N4: "trung cấp, từ vựng và ngữ pháp khá",
    N3: "khá nâng cao, từ vựng và ngữ pháp phức tạp",
    N2: "nâng cao, từ vựng và ngữ pháp khó",
    N1: "rất nâng cao, từ vựng và ngữ pháp rất khó",
  };

  let typeInstruction = "";

  switch (type) {
    case "KANJI_SELECTION":
      typeInstruction = `Bài tập chọn chữ kanji: Tạo câu với từ kanji được viết bằng chữ kanji thật (KHÔNG gạch ngang). Học sinh phải chọn phiên âm hiragana đúng của từ kanji đó.

YÊU CẦU QUAN TRỌNG:
- Câu hỏi chứa từ kanji thật (ví dụ: 食べる, 行く, 見る)
- Đáp án ĐÚNG là phiên âm hiragana của từ kanji đó (ví dụ: たべる, いく, みる)
- 3 đáp án SAI cũng là hiragana gây nhiễu (ví dụ: のむ, かく, よむ)
- TẤT CẢ 4 đáp án đều PHẢI là hiragana, KHÔNG được dùng kanji

VÍ DỤ CHÍNH XÁC:
Câu hỏi: "私は毎日_食べる_。"
Đáp án đúng: "たべる"
Đáp án sai: "のむ", "かく", "よむ"

ĐẢM BẢO: Không dùng kanji trong bất kỳ đáp án nào!`;
      break;
    case "HIRAGANA":
      typeInstruction = `
Tạo câu với chỗ trống dạng _ひらがな_. 4 đáp án, chỉ 1 đáp án đúng là chữ hiragana đó. Các đáp án khác phải gây nhiễu tốt.

VÍ DỤ CHÍNH XÁC:
Câu hỏi: "私は毎日_たべる_。"
Đáp án đúng: "食べる"
Đáp án sai: "読む", "書く", "浴びる"
`;
      break;
    case "VOCABULARY":
      typeInstruction = `Bài tập từ vựng: Tạo câu với chỗ trống dạng _物事_ (chỉ gạch một bên). 4 đáp án từ vựng, chỉ 1 đáp án đúng. Các đáp án khác cùng loại từ nhưng không phù hợp.
VÍ DỤ CHÍNH XÁC:
Câu hỏi: "試験の点数が悪かった___、もっと勉強しようと思った。"
Đáp án đúng: "から"
Đáp án sai: "ので", "のに", "けど"
		`;
      break;
    case "GRAMMAR":
      typeInstruction = `Bài tập ngữ pháp: Tạo câu với chỗ trống dạng ___ cho khoảng trống cần điền. 4 đáp án cấu trúc ngữ pháp, chỉ 1 đáp án đúng. Các đáp án khác gây nhiễu về ngữ pháp.
VÍ DỤ CHÍNH XÁC:
Câu hỏi: "彼は毎日学校へ___。"
Đáp án đúng: "行っています"
Đáp án sai: "行った", "行って", "行きます"
			`;
      break;
    case "SYNONYMS_ANTONYMS":
      typeInstruction = `Bài tập đồng/trái nghĩa: Tạo câu với từ được **bôi đậm**. 4 đáp án, chỉ 1 đáp án là từ đồng nghĩa hoặc trái nghĩa phù hợp nhất. Các đáp án khác gây nhiễu.
	  
VÍ DỤ CHÍNH XÁC:
Câu hỏi: "*ひまなとき*、ほんをよんでいます。"
Đáp án đúng: "時間がある"
Đáp án sai: "時間がない", "時間をはかる", "時間をまもる"
`;
      break;
    case "CONTEXTUAL_WORDS":
      typeInstruction = `Bài tập từ phù hợp ngữ cảnh: Tạo câu với chỗ trống dạng _物事_. 4 đáp án từ vựng, chỉ 1 đáp án phù hợp nhất với ngữ cảnh.
	  
VÍ DỤ CHÍNH XÁC:
Câu hỏi: "すべる"
Đáp án đúng: "コーヒーがすべってよごれてしまいました。"
Đáp án sai: "駅ですべってころんでしまいました。", "めがねをすべってわれてしまいました。", "最近はてんきがすべりやすいです"
`;
      break;
    case "JLPT_FORMAT":
      typeInstruction = `
  Bài tập định dạng JLPT: Hãy tạo **một câu hoàn chỉnh tự nhiên** bằng tiếng Nhật (trình độ N4–N5).
  Sau đó, ẩn phần từ cần điền bằng ký hiệu đặc biệt:
  - Dấu * (sao) biểu thị vị trí của **đáp án đúng**.
  - Ba dấu gạch dưới ___ biểu thị **các đáp án sai**, chúng cũng là các từ thật có thể điền vào câu nhưng không đúng ngữ cảnh.

  ⚙️ Yêu cầu chi tiết:
  1. Câu phải mang ngữ cảnh tự nhiên, đúng phong cách đề JLPT.
  2. Đáp án đúng (＊) phải là một từ hoặc cụm ngắn (động từ, danh từ, tính từ...).
  3. Ba đáp án sai (___) phải cùng loại từ, cùng ngữ pháp, nhưng sai nghĩa trong câu.
  4. Xuất kết quả gồm:
     - Câu hỏi tiếng Nhật với ký hiệu * và ___
     - Đáp án đúng
     - Danh sách 3 đáp án sai

  🧩 Ví dụ CHUẨN:
  Câu hỏi: "わたしは 山田先生 ＊ ___ ___ ___ います。"
  Đáp án đúng: "習って"
  Đáp án sai: "に", "ダンス", "を"
  `;
      break;
  }

  return `Bạn là chuyên gia tạo đề thi JLPT tiếng Nhật. Hãy tạo ${count} câu hỏi trắc nghiệm cho trình độ ${level} (${levelDescriptions[level]}).

YÊU CẦU:
- Mỗi câu hỏi phải theo định dạng JLPT thật
- Câu hỏi bằng tiếng Nhật, đáp án bằng tiếng Nhật
- ${typeInstruction}
- Mỗi câu hỏi có 4 đáp án (A, B, C, D)
- Chỉ 1 đáp án đúng
- Thêm giải thích ngắn gọn bằng tiếng Việt cho đáp án đúng

ĐỊNH DẠNG TRẢ VỀ (JSON):
[
  {
    "question": "Câu hỏi với chỗ trống",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correctAnswer": 0,
    "explanation": "Giải thích bằng tiếng Việt"
  }
]

Quan trọng: Chỉ trả về JSON array, không có text khác!`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { count, level, type } = body;

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: "Count must be between 1 and 20" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: {
        temperature: 0.4, // Nhiệt độ cao hơn để có sự đa dạng trong câu hỏi
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 4000, // Tăng tokens cho vocabulary và grammar
      },
    });
    const prompt = createPrompt(body);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let questions;
    try {
      // Remove any markdown formatting if present
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      questions = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    // Validate that we got an array
    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "AI did not return an array" },
        { status: 500 }
      );
    }

    // Validate each question
    const validQuestions = questions.filter((q) => {
      return (
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === "number" &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3 &&
        q.explanation
      );
    });

    if (validQuestions.length === 0) {
      return NextResponse.json(
        { error: "No valid questions generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: validQuestions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
