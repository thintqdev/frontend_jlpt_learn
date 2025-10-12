import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
    generationConfig: {
        temperature: 0.3,  // Giảm nhiệt độ để có response ổn định hơn
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 500,  // Giới hạn output để tránh text dài
    }
});

export async function POST(request: NextRequest) {
    try {
        const { word } = await request.json();

        if (!word) {
            return NextResponse.json(
                { error: 'Word is required' },
                { status: 400 }
            );
        }

        const prompt = `Phân tích từ tiếng Nhật này: "${word}"

QUAN TRỌNG: Chỉ trả lời bằng JSON object duy nhất, không thêm bất kỳ text, giải thích hay markdown nào khác.

Trả lời CHÍNH XÁC theo format này:
{"hiragana":"cách đọc","definition":"nghĩa tiếng Việt","example":"câu ví dụ tiếng Nhật","translation":"dịch nghĩa câu ví dụ"}

Yêu cầu:
- hiragana: Viết bằng hiragana/katakana, không romaji
- definition: Nghĩa tiếng Việt tự nhiên
- example: Câu ví dụ tiếng Nhật đơn giản
- translation: Dịch câu ví dụ sang tiếng Việt

CHỈ trả về JSON object, không có text hay markdown nào khác.`;

        const fullPrompt = `Bạn là chuyên gia tiếng Nhật chuyên phân tích từ vựng cho người Việt học tiếng Nhật. Bạn có kiến thức sâu về JLPT, ngữ pháp, và cách sử dụng từ vựng trong ngữ cảnh thực tế. Luôn trả lời bằng JSON hợp lệ.

${prompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const responseText = response.text().trim();

        if (!responseText) {
            throw new Error('No response from Gemini');
        }

        // Parse JSON response - handle various formats
        let vocabularyData;
        try {
            // First try direct parsing
            vocabularyData = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse raw response, trying to extract JSON...', responseText);

            // Try to extract JSON from markdown code blocks
            let jsonText = responseText;

            // Remove markdown code blocks
            jsonText = jsonText.replace(/```json\s*\n/g, '').replace(/```\s*$/g, '');
            jsonText = jsonText.replace(/```\s*\n/g, '').replace(/```\s*$/g, '');

            // Try to find JSON object between { and }
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonText = jsonMatch[0];
            }

            // Clean up any extra text before/after JSON
            jsonText = jsonText.trim();

            try {
                vocabularyData = JSON.parse(jsonText);
            } catch (secondParseError) {
                console.error('Failed to parse cleaned response:', jsonText);

                // If all else fails, try to manually extract data
                const hiraganaMatch = responseText.match(/"hiragana":\s*"([^"]+)"/);
                const definitionMatch = responseText.match(/"definition":\s*"([^"]+)"/);
                const exampleMatch = responseText.match(/"example":\s*"([^"]+)"/);
                const translationMatch = responseText.match(/"translation":\s*"([^"]+)"/);

                if (hiraganaMatch && definitionMatch) {
                    vocabularyData = {
                        hiragana: hiraganaMatch[1],
                        definition: definitionMatch[1],
                        example: exampleMatch ? exampleMatch[1] : "",
                        translation: translationMatch ? translationMatch[1] : ""
                    };
                } else {
                    throw new Error('Could not extract valid JSON or data from Gemini response');
                }
            }
        }

        // Validate required fields
        const requiredFields = ['hiragana', 'definition'];
        const missingFields = requiredFields.filter(field => !vocabularyData[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        } return NextResponse.json({
            success: true,
            data: vocabularyData
        });

    } catch (error) {
        console.error('Error generating vocabulary:', error);

        // Return fallback data if API fails
        const { word: requestWord } = await request.json().catch(() => ({ word: 'word' }));
        const fallbackData = {
            hiragana: "よみかた",
            definition: "nghĩa của từ",
            example: `${requestWord}を使います。`,
            translation: `Sử dụng ${requestWord}.`
        }; return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: fallbackData
        }, { status: 500 });
    }
}