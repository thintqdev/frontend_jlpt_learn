import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
	model: "gemini-2.0-flash-001",
	generationConfig: {
		temperature: 0.3,
		topK: 20,
		topP: 0.8,
		maxOutputTokens: 3000,
	},
});

interface ClozeQuestion {
	passage: string;
	blanks: Array<{
		id: number;
		original: string;
		options: string[];
		correctAnswer: number;
	}>;
	translation: string;
	explanations: string[];
	highlightedWords: string[];
}

export async function POST(request: NextRequest) {
	try {
		const { words, level = "N3", questionCount = 5 } = await request.json();

		if (!words || !Array.isArray(words) || words.length === 0) {
			return NextResponse.json(
				{ error: "Words array is required" },
				{ status: 400 }
			);
		}

		// Build word list with kanji (hiragana) - meaning
		const selectedWords = words.slice(0, Math.max(questionCount, 6));
		const wordsList = selectedWords
			.map(
				(w: any) =>
					`${w.kanji || w.word || ""} (${w.hiragana || w.reading || ""}) - ${w.meaning || ""}`
			)
			.join("\n");

		const prompt = `Bạn là chuyên gia tạo bài luyện tập tiếng Nhật. Hãy tạo một đoạn văn tiếng Nhật tự nhiên hoàn chỉnh với chỗ trống để điền từ.

DANH SÁCH TỪ VỰNG CẦN DÙNG:
${wordsList}

YÊU CẦU:
1. Viết một đoạn văn tiếng Nhật tự nhiên khoản 200-300 chữ, sử dụng ít nhất ${Math.max(questionCount, 6)} từ từ danh sách (mỗi từ dùng 1 lần)
2. Chọn ${questionCount} từ từ danh sách để làm chỗ trống (thay bằng ___, không cần đánh số)
3. Với mỗi chỗ trống, cung cấp 4 lựa chọn: 1 đáp án đúng (từ gốc) và 3 từ sai cùng loại, được sắp xếp ngẫu nhiên
4. Các đáp án sai phải là từ khác nhau (từ các từ trong danh sách hoặc từ vựng tiếng Nhật khác cùng loại)
5. Đáp án sai không được là các từ khác từ danh sách nhưng xuất hiện ở vị trí khác trong đoạn văn
6. Đoạn văn phải phù hợp với trình độ ${level}, sử dụng ngữ pháp và từ vựng phù hợp
7. Dịch nghĩa đoạn văn sang tiếng Việt
8. Giải thích ngắn gọn tại sao từ được chọn là đáp án đúng cho mỗi chỗ trống, bằng tiếng Việt.
9. Liệt kê các từ vựng từ danh sách đã được sử dụng trong đoạn văn để highlight

ĐỊNH DẠNG JSON (CHỈ JSON, KHÔNG CÓ TEXT KHÁC):
{
  "passage": "Đoạn văn tiếng Nhật với chỗ trống ___, v.v.",
  "blanks": [
    {
      "id": 0,
      "original": "từ gốc (kanji)",
      "options": ["từ đúng", "từ sai 1", "từ sai 2", "từ sai 3"],
      "correctAnswer": 0
    }
  ],
  "translation": "Bản dịch tiếng Việt của đoạn văn",
  "explanations": ["Giải thích cho chỗ trống 1", "Giải thích cho chỗ trống 2"],
  "highlightedWords": ["từ 1", "từ 2", "từ 3"]
}

CHỈ trả về JSON object, không có text hay giải thích khác!`;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const responseText = response.text().trim();

		if (!responseText) {
			throw new Error("No response from AI");
		}

		// Parse JSON
		let data;
		try {
			const cleanText = responseText
				.replace(/```json\s*\n?/i, "")
				.replace(/\n?```$/i, "")
				.trim();
			data = JSON.parse(cleanText);
		} catch (parseError) {
			console.error("Failed to parse AI response:", responseText);
			throw new Error("Invalid JSON response from AI");
		}

		if (!data.passage || !Array.isArray(data.blanks)) {
			throw new Error("Invalid response format: missing passage or blanks");
		}

		// Process passage and blanks
		const processedPassage = data.passage;
		const blanks = data.blanks.map((blank: any, idx: number) => ({
			id: idx,
			original: blank.original,
			options: blank.options || [],
			correctAnswer: blank.correctAnswer ?? 0,
		}));

		const highlightedWords = data.highlightedWords || [];

		// Shuffle options in each blank to ensure correct answer is not always first
		const shuffledBlanks = blanks.map((blank: any) => {
			const options = [...blank.options];
			const items = options.map((text, idx) => ({ text, origIdx: idx }));

			// Fisher-Yates shuffle
			for (let i = items.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[items[i], items[j]] = [items[j], items[i]];
			}

			const newOptions = items.map((it) => it.text);
			const newCorrect = items.findIndex((it) => it.origIdx === blank.correctAnswer);

			return {
				...blank,
				options: newOptions,
				correctAnswer: newCorrect >= 0 ? newCorrect : 0,
			};
		});

		return NextResponse.json({
			passage: processedPassage,
			blanks: shuffledBlanks,
			translation: data.translation || "",
			explanations: data.explanations || [],
			highlightedWords: highlightedWords,
		});
	} catch (error) {
		console.error("Error generating vocabulary reading:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
