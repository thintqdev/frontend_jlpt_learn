import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
	model: "gemini-2.0-flash-001",
	generationConfig: {
		temperature: 0.4,  // Nhiệt độ cao hơn để có sự đa dạng trong câu hỏi
		topK: 20,
		topP: 0.8,
		maxOutputTokens: 4000,  // Tăng tokens cho vocabulary và grammar
	}
}); export async function POST(request: NextRequest) {
	try {
		const { content, level = "N3" } = await request.json();

		if (!content) {
			return NextResponse.json(
				{ error: 'Content is required' },
				{ status: 400 }
			);
		}

		const prompt = `Phân tích bài đọc tiếng Nhật này và tạo câu hỏi đọc hiểu cùng với từ vựng và ngữ pháp:

BÀI ĐỌC:
"${content}"

YÊU CẦU:
- Tạo bản dịch đầy đủ sang tiếng Việt cho toàn bộ bài đọc
- Tạo 1-4 câu hỏi đọc hiểu bằng TIẾNG NHẬT phù hợp với trình độ ${level}
- Mỗi câu hỏi phải có 4 đáp án lựa chọn
- Chỉ có 1 đáp án đúng, 3 đáp án sai
- Các đáp án sai PHẢI xuất hiện trong bài đọc (để đánh lừa người học)
- Câu hỏi phải kiểm tra sự hiểu biết về nội dung chính, từ vựng, ngữ pháp
- Tạo giải thích chi tiết cho từng câu hỏi bằng tiếng Việt

- Tìm khoảng 8-12 từ vựng KHÓ và quan trọng trong bài đọc
- Với mỗi từ vựng: cung cấp từ gốc, cách đọc hiragana, nghĩa tiếng Việt, ví dụ câu
- Tìm 2-3 cấu trúc ngữ pháp quan trọng được sử dụng trong bài đọc
- Với mỗi ngữ pháp: cung cấp pattern, nghĩa tiếng Việt, ví dụ câu

QUAN TRỌNG: Chỉ trả lời bằng JSON object, không thêm bất kỳ text, giải thích hay markdown nào khác.

Format JSON chính xác:
{
  "translation": "Bản dịch đầy đủ sang tiếng Việt",
  "questions": [
    {
      "question": "Câu hỏi bằng tiếng Nhật",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 0
    }
  ],
  "questionExplanations": [
    "Giải thích chi tiết cho câu hỏi 1 bằng tiếng Việt",
    "Giải thích chi tiết cho câu hỏi 2 bằng tiếng Việt"
  ],
  "vocabulary": [
    {
      "word": "漢字",
      "reading": "ひらがな",
      "meaning": "nghĩa tiếng Việt",
      "example": "câu ví dụ tiếng Nhật"
    }
  ],
  "grammar": [
    {
      "pattern": "cấu trúc ngữ pháp",
      "meaning": "nghĩa tiếng Việt",
      "example": "câu ví dụ"
    }
  ]
}

Yêu cầu chi tiết:
- translation: Bản dịch đầy đủ, chính xác sang tiếng Việt
- questions: Mảng câu hỏi như trên
- questionExplanations: Mảng giải thích cho từng câu hỏi, theo thứ tự
- vocabulary: Mảng từ vựng quan trọng, KHÓ (không phải từ đơn giản)
- grammar: Mảng ngữ pháp được sử dụng trong bài đọc
- correctAnswer: Số từ 0-3 chỉ vị trí đáp án đúng

CHỈ trả về JSON object, không có text hay markdown nào khác.`;
		const fullPrompt = `Bạn là chuyên gia tạo đề thi JLPT tiếng Nhật, đặc biệt giỏi về phần đọc hiểu và phân tích từ vựng/ngữ pháp. Bạn có khả năng phân tích văn bản tiếng Nhật và tạo nội dung giáo dục chất lượng cao.

Hãy phân tích bài đọc được cung cấp và tạo:
1. 2-3 câu hỏi đọc hiểu bằng TIẾNG NHẬT với 4 đáp án (1 đúng, 3 sai từ bài đọc)
2. 8-12 từ vựng KHÓ và quan trọng nhất trong bài đọc
3. 2-3 cấu trúc ngữ pháp được sử dụng trong bài đọc

${prompt}`;

		const result = await model.generateContent(fullPrompt);
		const response = await result.response;
		const responseText = response.text().trim();

		if (!responseText) {
			return NextResponse.json(
				{ error: 'No response from AI' },
				{ status: 500 }
			);
		}

		// Parse JSON response
		let responseData;
		try {
			// Remove any markdown formatting if present
			const cleanText = responseText.replace(/```json\s*|\s*```/g, '').trim();
			responseData = JSON.parse(cleanText);
		} catch (parseError) {
			console.error('Failed to parse AI response:', responseText);
			return NextResponse.json(
				{ error: 'Invalid response format from AI' },
				{ status: 500 }
			);
		}        // Validate response structure
		if (!responseData.questions || !Array.isArray(responseData.questions)) {
			return NextResponse.json(
				{ error: 'Response must contain questions array' },
				{ status: 500 }
			);
		}

		// Validate translation
		if (!responseData.translation || typeof responseData.translation !== 'string') {
			return NextResponse.json(
				{ error: 'Response must contain translation string' },
				{ status: 500 }
			);
		}

		// Validate question explanations
		if (!responseData.questionExplanations || !Array.isArray(responseData.questionExplanations)) {
			return NextResponse.json(
				{ error: 'Response must contain questionExplanations array' },
				{ status: 500 }
			);
		}

		// Validate each question
		for (const question of responseData.questions) {
			if (!question.question || !Array.isArray(question.options) || question.options.length !== 4 || typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer > 3) {
				return NextResponse.json(
					{ error: 'Invalid question format' },
					{ status: 500 }
				);
			}
		}

		// Validate vocabulary and grammar if present
		if (responseData.vocabulary && !Array.isArray(responseData.vocabulary)) {
			return NextResponse.json(
				{ error: 'Vocabulary must be an array' },
				{ status: 500 }
			);
		}

		if (responseData.grammar && !Array.isArray(responseData.grammar)) {
			return NextResponse.json(
				{ error: 'Grammar must be an array' },
				{ status: 500 }
			);
		}

		return NextResponse.json(responseData);
	} catch (error) {
		console.error('Error generating reading questions:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}