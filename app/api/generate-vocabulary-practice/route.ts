import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
	model: "gemini-2.0-flash-001",
	generationConfig: {
		temperature: 0.3, // Tăng nhiệt độ để có sự đa dạng trong câu hỏi
		topK: 40,
		topP: 0.9,
		maxOutputTokens: 4000,
	},
});

export async function POST(request: NextRequest) {
	try {
		const { words, allWords, questionCount, questionTypes } = await request.json();

		if (!words || !Array.isArray(words) || words.length === 0) {
			return NextResponse.json(
				{ error: "Words array is required" },
				{ status: 400 }
			);
		}

		const count = questionCount || 10;
		const types = questionTypes || ["fill-in-blank"];

		// Generate all questions in one API call
		const questions = await generateAllVocabularyQuestions(words, allWords, count);

		return NextResponse.json({ questions });
	} catch (error) {
		console.error("Error generating vocabulary questions:", error);
		return NextResponse.json(
			{ error: "Failed to generate questions" },
			{ status: 500 }
		);
	}
}

async function generateAllVocabularyQuestions(words: any[], allWords: any[], count: number) {
	// Tạo một prompt duy nhất để generate tất cả câu hỏi cùng lúc
	const prompt = `Tạo ${count} câu hỏi điền từ vào chỗ trống theo dạng JLPT N3-N2 cho các từ vựng sau:

DANH SÁCH TỪ VỰNG:
${words.map((word, index) => `${index + 1}. ${word.kanji} (${word.hiragana}) - Nghĩa: ${word.meaning}`).join('\n')}

CÁC TỪ KHÁC ĐỂ TẠO LỰANCHỌN SAI:
${allWords.slice(0, 20).map(word => `${word.kanji} (${word.meaning})`).join(', ')}

YÊU CẦU:
- Tạo ${count} câu hỏi khác nhau, mỗi câu sử dụng 1 từ trong danh sách
- Mỗi câu phải là câu tiếng Nhật tự nhiên, có chỗ trống (___) ở vị trí của từ cần điền
- Câu hỏi PHẢI đa dạng về ngữ cảnh (không chỉ về đồ uống/đồ ăn)
- Mỗi câu có 4 lựa chọn A, B, C, D
- Lựa chọn A luôn là từ đúng
- 3 lựa chọn còn lại phải CÙNG LOẠI TỪ nhưng không phù hợp ngữ cảnh hoặc ngữ pháp
- TRÁNH các đáp án cùng semantic field có thể thay thế (VD: con trai/con gái/cháu - thay bằng con trai/bạn bè/giáo viên/sách)

CÁC DẤU HIỆU NHẬN BIẾT TỪ VỰNG TRONG ĐỀ JLPT (theo pattern thực tế):
- Dấu hiệu nghĩa tích cực/tiêu cực: いい___、悪い___、すばらしい___
- Dấu hiệu mức độ: とても___、すごく___、ちょっと___、あまり___ない
- Dấu hiệu tần suất: いつも___、時々___、全然___ない
- Dấu hiệu so sánh: ___より、___ほど、一番___
- Dấu hiệu nguyên nhân: ___ため、___ので、___から
- Dấu hiệu kết quả: ___になる、___させる、___れる/られる
- Dấu hiệu trạng thái: ___している、___てある、___ばかり
- Dấu hiệu cảm xúc: ___そう、___らしい、___みたい

NGUYÊN TẮC TẠO ĐÁP ÁN GÂY NHIỄU HIỆU QUẢ:
- Dùng CÙNG LOẠI TỪ nhưng khác ngữ cảnh/ý nghĩa
- Ví dụ TỐT cho danh từ người: 息子 (con trai) vs 先生 (giáo viên) vs 友達 (bạn bè) vs 本 (sách - vật)
- Ví dụ TỐT cho tính từ: 静か (yên tĩnh) vs 暑い (nóng) vs 美味しい (ngon) vs 高い (cao/đắt)
- Ví dụ TỐT cho động từ: 食べる (ăn) vs 読む (đọc) vs 寝る (ngủ) vs 働く (làm việc)
- Ví dụ XẤU: 息子 vs 娘 vs 甥 vs 姪 (tất cả đều thay thế được trong cùng ngữ cảnh)

Trả về JSON array với format:
[
  {
    "id": "q1",
    "type": "fill-in-blank", 
    "question": "Câu tiếng Nhật có chỗ trống",
    "options": ["A. [TỪ ĐÚNG]", "B. [TỪ SAI 1]", "C. [TỪ SAI 2]", "D. [TỪ SAI 3]"],
    "correctAnswer": 0,
    "explanation": "Câu nghĩa: [Nghĩa tiếng Việt của câu]. Đáp án đúng: [từ] ([nghĩa]). Các đáp án sai: B, C, D với nghĩa của từng từ. Lý do chọn đáp án đúng",
    "word": "kanji của từ đúng"
  }
]

QUAN TRỌNG: Chỉ trả về JSON array, không có text nào khác!`;

	try {
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const responseText = response.text().trim();

		// Xóa markdown code blocks nếu có
		const cleanedText = responseText.replace(/^```json\n?/i, '').replace(/\n?```$/i, '');

		const questions = JSON.parse(cleanedText);

		// Add unique IDs and wordData
		return questions.map((q: any, index: number) => ({
			...q,
			id: `ai_${Date.now()}_${index}`,
			wordData: words.find(w => w.kanji === q.word) || words[index % words.length]
		}));
	} catch (error) {
		console.error("Error parsing AI response:", error);
		// Fallback to individual generation
		return generateVocabularyQuestionsIndividual(words, allWords, count);
	}
}

async function generateVocabularyQuestionsIndividual(words: any[], allWords: any[], count: number) {
	const questions = [];

	for (let i = 0; i < Math.min(count, words.length); i++) {
		const word = words[i];
		const question = await generateFillInBlankQuestion(word, allWords);
		questions.push(question);
	}

	return questions;
}

async function generateFillInBlankQuestion(word: any, allWords: any[]) {
	const prompt = `Tạo câu hỏi điền từ vào chỗ trống theo dạng JLPT N3-N2 cho từ vựng tiếng Nhật:

Từ vựng cần luyện: ${word.kanji} (${word.hiragana}) - Nghĩa tiếng Việt: ${word.meaning}

YÊU CẦU:
- Tạo một câu tiếng Nhật có ngữ cảnh CỤ THỂ, có chỗ trống (___) ở vị trí chính xác của từ này
- Câu phải có dấu hiệu ngữ pháp/ngữ cảnh để loại trừ các đáp án sai
- Câu hỏi PHẢI đa dạng, không chỉ về đồ uống hay đồ ăn
- Cung cấp 4 lựa chọn từ vựng để điền vào chỗ trống
- Lựa chọn A luôn là từ đúng (${word.kanji})
- 3 lựa chọn còn lại (B, C, D) phải CÙNG LOẠI TỪ nhưng không phù hợp ngữ cảnh cụ thể
- TRÁNH: các từ trong cùng nhóm semantic có thể thay thế (gia đình, động vật cùng loại, etc.)

CÁC PATTERN DẤU HIỆU JLPT THỰC TẾ (chọn phù hợp với từ vựng):
1. Tính từ + danh từ: 新しい___、古い___、大きな___、小さな___
2. Trạng từ mức độ: とても___、すごく___、ちょっと___、かなり___
3. Phủ định: あまり___ない、全然___ない、___じゃない
4. So sánh: AはBより___、一番___、___ほど___ない
5. Nguyên nhân: ___ので、___ため、___から、___せいで
6. Kết quả/thay đổi: ___になる、___くなる、___させる
7. Trạng thái tiếp diễn: ___している、___てある、___ている
8. Cảm nhận: ___そう、___みたい、___らしい、___っぽい
9. Khả năng: ___できる、___られる、___やすい、___にくい
10. Tần suất: いつも___、時々___、たまに___、めったに___ない

VÍ DỤ CỤ THỂ VỚI DẤU HIỆU JLPT:

Từ: 便利 (べんり) - tiện lợi
Câu: このアプリはとても___です。
Dấu hiệu: "とても" + です → cần tính từ-na, ngữ cảnh app → tính chất công nghệ
Lựa chọn:
A. 便利 (tiện lợi - tính từ-na, phù hợp app, đúng)
B. 美味しい (ngon - tính từ-i, không dùng cho app)
C. 暑い (nóng - tính từ-i, không liên quan app) 
D. 静か (yên tĩnh - tính từ-na, không phù hợp đặc tính app)
Giải thích: Câu nghĩa: "Ứng dụng này rất tiện lợi". Đáp án đúng: 便利 (tiện lợi). Các đáp án sai: B. 美味しい (ngon - cho đồ ăn), C. 暑い (nóng - thời tiết), D. 静か (yên tĩnh - không phù hợp app). Lý do: app cần tính từ chỉ tính năng công nghệ.

Từ: 息子 (むすこ) - con trai
Câu: 私の___は、毎日サッカーの練習をしています。
Dấu hiệu: "私の" + "サッカーの練習" → cần danh từ chỉ người, ngữ cảnh thể thao
Lựa chọn:
A. 息子 (con trai - danh từ người, phù hợp tuổi trẻ chơi bóng, đúng)
B. 先生 (giáo viên - danh từ người, ít khi luyện tập hàng ngày)
C. 本 (sách - danh từ vật, không thể luyện tập)
D. 母 (mẹ - danh từ người, ít khi chơi bóng đá)
Giải thích: Câu nghĩa: "Con trai tôi luyện tập bóng đá mỗi ngày". Đáp án đúng: 息子 (con trai). Các đáp án sai: B. 先生 (giáo viên - không phù hợp ngữ cảnh), C. 本 (sách - không phải người), D. 母 (mẹ - ít chơi bóng đá). Lý do: ngữ cảnh luyện tập bóng đá phù hợp với con trai trẻ.

Từ: 上手 (じょうず) - giỏi
Câu: 田中さんは英語が___です。
Dấu hiệu: が + kỹ năng/khả năng → cần từ chỉ trình độ
Lựa chọn:
A. 上手 (giỏi - đúng)
B. 好き (thích - khác nghĩa)
C. 大切 (quan trọng - không phù hợp)
D. 元気 (khỏe mạnh - không liên quan)
Giải thích: Câu nghĩa: "Anh Tanaka giỏi tiếng Anh". Đáp án đúng: 上手 (giỏi). Các đáp án sai: B. 好き (thích), C. 大切 (quan trọng), D. 元気 (khỏe mạnh). Lý do: が với kỹ năng cần từ chỉ trình độ.

QUAN TRỌNG - NGUYÊN TẮC TẠO CÂU JLPT:
- SỬ DỤNG DẤU HIỆU: câu phải có từ/cụm từ gợi ý (とても, あまり, より, など)
- LOGIC NGỮ PHÁP: dựa vào particle (が, を, に, で) và vị trí từ vựng để loại trừ đáp án sai
- NGHĨA HỢP LÝ: từ phải phù hợp về mặt ngữ nghĩa với ngữ cảnh CỤ THỂ
- ĐÁP ÁN SAI HIỆU QUẢ: CÙNG LOẠI TỪ nhưng khác ngữ cảnh hoặc không logic trong tình huống cụ thể  
- TRÁNH ĐÁP ÁN CÙNG SEMANTIC FIELD: không dùng con trai/con gái/cháu, thay bằng con trai/giáo viên/bạn bè/sách
- GIẢI THÍCH ĐẦY ĐỦ: nghĩa tiếng Việt của câu, đáp án đúng và sai kèm loại từ, lý do ngữ pháp
- VÍ DỤ TỐT: "とても___です" (便利 vs 暑い/美味しい/静か - cùng tính từ khác ngữ cảnh), "私の___は" (息子 vs 先生/本/母 - khác logic)

Trả về CHỈ JSON format:
{
  "type": "fill-in-blank",
  "question": "Câu tiếng Nhật có chỗ trống: [CÂU TIẾNG NHẬT VỚI ___]",
  "options": ["A. [TỪ ĐÚNG]", "B. [TỪ SAI 1]", "C. [TỪ SAI 2]", "D. [TỪ SAI 3]"],
  "correctAnswer": 0,
  "explanation": "Câu nghĩa: [Nghĩa tiếng Việt của toàn bộ câu]. Đáp án đúng: ${word.kanji} (${word.meaning}). Các đáp án sai: B. [từ sai] ([nghĩa]), C. [từ sai] ([nghĩa]), D. [từ sai] ([nghĩa]). Lý do chọn đáp án A: [giải thích logic].",
  "word": "${word.kanji}"
}

CHÚ Ý: Chỉ trả về JSON, không có text nào khác!`;

	const result = await model.generateContent(prompt);
	const response = await result.response;
	const responseText = response.text().trim();

	try {
		const parsed = JSON.parse(responseText);
		return {
			id: `fib_${Date.now()}_${Math.random()}`,
			...parsed,
			wordData: word
		};
	} catch (error) {
		// Fallback
		return createFallbackJLPTQuestion(word, allWords);
	}
}

function createFallbackJLPTQuestion(word: any, allWords: any[]) {
	// Tạo câu hỏi với dấu hiệu JLPT rõ ràng
	const contexts = [
		`とても___です。`,  // dấu hiệu mức độ cao
		`あまり___ではありません。`, // dấu hiệu phủ định
		`___が上手です。`, // dấu hiệu kỹ năng với が
		`___を勉強しています。`, // dấu hiệu học tập với を
		`___な人です。`, // dấu hiệu tính từ -na
		`___そうです。`, // dấu hiệu cảm nhận
		`___になりました。`, // dấu hiệu thay đổi trạng thái
		`一番___です。` // dấu hiệu so sánh tuyệt đối
	];

	const randomContext = contexts[Math.floor(Math.random() * contexts.length)];

	const otherWords = allWords
		.filter(w => w.id !== word.id)
		.sort(() => Math.random() - 0.5)
		.slice(0, 3);

	const options = [
		word.kanji,
		...otherWords.map(w => w.kanji)
	].sort(() => Math.random() - 0.5);

	const correctIndex = options.indexOf(word.kanji);

	return {
		id: `jlpt_fallback_${Date.now()}_${Math.random()}`,
		type: "fill-in-blank",
		question: `${randomContext} Từ nào phù hợp nhất để điền vào chỗ trống?`,
		options: options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`),
		correctAnswer: correctIndex,
		explanation: `Trong ngữ cảnh này, "${word.kanji}" (${word.meaning}) là từ phù hợp nhất.`,
		wordData: word
	};
}