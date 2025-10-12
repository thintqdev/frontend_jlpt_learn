"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Volume2,
  Plus,
  BookOpen,
  Lightbulb,
  X,
  Search,
  Save,
  Loader2,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { fetchShortCategories } from "@/lib/category";
import {
  createVocabulary,
  searchVocabulary as searchVocabularyAPI,
} from "@/lib/vocabulary";

interface VocabularyItem {
  id?: number;
  kanji?: string;
  hiragana: string;
  definition: string;
  example?: string;
  translation?: string;
  is_learned?: boolean;
  category?: {
    id: number;
    name: string;
    nameJp: string;
    level: string;
  };
}

interface Category {
  id: number;
  name: string;
  nameJp: string;
  level: string;
  description?: string;
}

interface TooltipPosition {
  x: number;
  y: number;
  transform?: string;
}

interface JapaneseTextTooltipProps {
  children: React.ReactNode;
  vocabulary?: VocabularyItem[];
  categories?: Category[];
  onAddVocabulary?: (vocab: VocabularyItem) => void;
  className?: string;
}

export default function JapaneseTextTooltip({
  children,
  vocabulary = [],
  categories = [],
  onAddVocabulary,
  className = "",
}: JapaneseTextTooltipProps) {
  const [selectedText, setSelectedText] = useState("");
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const [foundVocab, setFoundVocab] = useState<VocabularyItem | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [preventClose, setPreventClose] = useState(false);

  // Form states for adding new vocabulary
  const [newVocab, setNewVocab] = useState<VocabularyItem>({
    kanji: "",
    hiragana: "",
    definition: "",
    example: "",
    translation: "",
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    categories[0]?.id || 1
  );
  const [loadedCategories, setLoadedCategories] =
    useState<Category[]>(categories);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const hasLoadedCategories = useRef(false);

  // Update loaded categories when categories prop changes
  useEffect(() => {
    if (categories.length > 0) {
      setLoadedCategories(categories);
      hasLoadedCategories.current = true;
    }
  }, [categories.length]);

  // Load categories if not provided
  useEffect(() => {
    if (
      categories.length === 0 &&
      !hasLoadedCategories.current &&
      !isLoadingCategories
    ) {
      setIsLoadingCategories(true);
      hasLoadedCategories.current = true;

      fetchShortCategories()
        .then((data: any) => {
          console.log("Categories data:", data); // Debug log

          // Handle different possible response structures
          let items: any[] = [];
          if (Array.isArray(data)) {
            items = data;
          } else if (data && data.items && Array.isArray(data.items)) {
            items = data.items;
          } else if (
            data &&
            data.categories &&
            Array.isArray(data.categories)
          ) {
            items = data.categories;
          }

          const mappedCategories = items.map((item: any) => ({
            id: Number(item.id),
            name: item.name,
            nameJp: item.nameJp,
            level: item.level, // Default level since it's not in the response
            description: item.description,
          }));
          setLoadedCategories(mappedCategories);
          if (mappedCategories.length > 0) {
            setSelectedCategoryId(mappedCategories[0].id);
          }
        })
        .catch((error) => {
          console.error("Failed to load categories:", error);
          hasLoadedCategories.current = false; // Reset on error so it can retry
        })
        .finally(() => {
          setIsLoadingCategories(false);
        });
    }
  }, []); // Empty dependency array - only run once on mount

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isAddingVocab = useRef(false);

  // Function to search vocabulary in database using API
  const searchVocabulary = useCallback(
    async (text: string): Promise<VocabularyItem | null> => {
      try {
        // First check local fake database for immediate response
        const allVocab = [...vocabulary];
        const localFound = allVocab.find(
          (item) => item.kanji === text || item.hiragana === text
        );

        if (localFound) {
          return localFound;
        }

        // If not found locally, search via API
        const searchResult = await searchVocabularyAPI(text);

        // Return the result (single vocabulary or null)
        return searchResult;
      } catch (error) {
        console.error("Error searching vocabulary:", error);

        // Fallback to local search if API fails
        const allVocab = [...vocabulary];
        let found = allVocab.find(
          (item) => item.kanji === text || item.hiragana === text
        );

        // If not found, try partial matches
        if (!found) {
          found = allVocab.find(
            (item) =>
              (item.kanji &&
                (text.includes(item.kanji) || item.kanji.includes(text))) ||
              text.includes(item.hiragana) ||
              item.hiragana.includes(text)
          );
        }

        return found || null;
      }
    },
    [vocabulary]
  );

  // Calculate optimal tooltip position
  const calculateTooltipPosition = useCallback((rect: DOMRect) => {
    const tooltipWidth = 320; // w-80 = 320px
    const tooltipHeight = 350; // estimated height
    const margin = 10; // margin from viewport edges
    const gap = 8; // gap between tooltip and selected text

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Default position: center above the selection
    let x = rect.left + rect.width / 2;
    let y = rect.top - gap;
    let transform = "translate(-50%, -100%)";

    // Priority 1: Try to show above the selection
    const hasSpaceAbove = rect.top - tooltipHeight - gap >= margin + scrollY;
    const hasSpaceBelow =
      rect.bottom + tooltipHeight + gap <= viewportHeight + scrollY - margin;

    // Check if tooltip would overflow horizontally when centered
    const wouldOverflowLeft = x - tooltipWidth / 2 < margin;
    const wouldOverflowRight = x + tooltipWidth / 2 > viewportWidth - margin;

    if (hasSpaceAbove && !wouldOverflowLeft && !wouldOverflowRight) {
      // Perfect: show centered above
      x = rect.left + rect.width / 2;
      y = rect.top - gap;
      transform = "translate(-50%, -100%)";
    } else if (hasSpaceBelow && !wouldOverflowLeft && !wouldOverflowRight) {
      // Good: show centered below
      x = rect.left + rect.width / 2;
      y = rect.bottom + gap;
      transform = "translate(-50%, 0)";
    } else if (hasSpaceAbove) {
      // Show above but adjust horizontal position
      y = rect.top - gap;
      if (wouldOverflowLeft) {
        x = rect.left;
        transform = "translateY(-100%)";
      } else if (wouldOverflowRight) {
        x = rect.right;
        transform = "translate(-100%, -100%)";
      } else {
        x = rect.left + rect.width / 2;
        transform = "translate(-50%, -100%)";
      }
    } else if (hasSpaceBelow) {
      // Show below but adjust horizontal position
      y = rect.bottom + gap;
      if (wouldOverflowLeft) {
        x = rect.left;
        transform = "translateY(0)";
      } else if (wouldOverflowRight) {
        x = rect.right;
        transform = "translate(-100%, 0)";
      } else {
        x = rect.left + rect.width / 2;
        transform = "translate(-50%, 0)";
      }
    } else {
      // Last resort: show to the side
      const centerY = rect.top + rect.height / 2;
      const isNearLeftEdge = rect.left < viewportWidth / 2;

      if (isNearLeftEdge) {
        // Show to the right
        x = rect.right + gap;
        y = centerY;
        transform = "translate(0, -50%)";
      } else {
        // Show to the left
        x = rect.left - gap;
        y = centerY;
        transform = "translate(-100%, -50%)";
      }
    }

    return {
      x: x + scrollX,
      y: y + scrollY,
      transform,
    };
  }, []);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setShowTooltip(false);
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setShowTooltip(false);
      return;
    }

    // Check if selection contains Japanese characters
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
      selectedText
    );
    if (!hasJapanese) {
      setShowTooltip(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const position = calculateTooltipPosition(rect);

    setSelectedText(selectedText);
    setTooltipPosition({
      x: position.x,
      y: position.y,
      transform: position.transform,
    });

    // Search for vocabulary
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const vocab = await searchVocabulary(selectedText);
        setFoundVocab(vocab);
        setIsLoading(false);
        setShowTooltip(true);
      } catch (error) {
        console.error("Error searching vocabulary:", error);
        setFoundVocab(null);
        setIsLoading(false);
        setShowTooltip(true);
      }
    }, 300);
  }, [searchVocabulary, calculateTooltipPosition]);

  // Handle click outside to close tooltip
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      // Don't close if dialog is open, about to open, or if we're adding vocab
      if (showAddDialog || preventClose || isAddingVocab.current) return;

      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    },
    [showAddDialog, preventClose]
  ); // Handle window resize to reposition tooltip
  const handleWindowResize = useCallback(() => {
    if (showTooltip && selectedText) {
      // Hide tooltip on resize to avoid positioning issues
      setShowTooltip(false);
    }
  }, [showTooltip, selectedText]);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    // Use setTimeout to delay the click listener attachment
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("scroll", handleWindowResize);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("scroll", handleWindowResize);
    };
  }, [handleTextSelection, handleClickOutside, handleWindowResize]);

  // Handle adding new vocabulary
  const handleAddVocabulary = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedText) return;

    // Set flag to prevent tooltip closing
    isAddingVocab.current = true;

    setNewVocab({
      kanji: selectedText,
      hiragana: "",
      definition: "",
      example: "",
      translation: "",
    });
    setGenerateSuccess(false);

    // Set dialog to open
    setShowAddDialog(true);

    // Reset flag after dialog is definitely open
    setTimeout(() => {
      isAddingVocab.current = false;
    }, 200);
  };

  const handleSaveVocabulary = async () => {
    if (!newVocab.hiragana || !newVocab.definition) {
      return;
    }

    try {
      // Use the createVocabulary function from lib/vocabulary.ts
      const result = await createVocabulary({
        kanji: newVocab.kanji || "",
        hiragana: newVocab.hiragana,
        definition: newVocab.definition,
        example: newVocab.example || undefined,
        translation: newVocab.translation || "", // Provide empty string if no translation
        categoryId: selectedCategoryId,
      });

      if (result) {
        // Transform the result to match VocabularyItem interface
        const vocabularyItem: VocabularyItem = {
          id: result.id,
          kanji: newVocab.kanji,
          hiragana: newVocab.hiragana,
          definition: result.definition,
          example: newVocab.example,
          translation: result.translation,
          category: loadedCategories.find(
            (cat) => cat.id === selectedCategoryId
          ),
        };

        onAddVocabulary?.(vocabularyItem);
        setShowAddDialog(false);
        setShowTooltip(false);

        // Reset form
        setNewVocab({
          kanji: "",
          hiragana: "",
          definition: "",
          example: "",
          translation: "",
        });
        setGenerateSuccess(false);
      }
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      // You could add error state/toast notification here
    }
  };

  // Handle dialog close - also close tooltip
  const handleDialogClose = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      // When dialog closes, also close tooltip
      setTimeout(() => {
        setShowTooltip(false);
      }, 50);
    }
  };

  // AI Auto Generate function
  const handleAutoGenerate = async () => {
    if (!selectedText) return;

    setIsGenerating(true);
    try {
      // Call OpenAI API to generate vocabulary
      const response = await fetch("/api/generate-vocabulary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: selectedText }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setNewVocab((prev) => ({
          ...prev,
          hiragana: result.data.hiragana,
          definition: result.data.definition,
          example: result.data.example,
          translation: result.data.translation,
        }));

        // Show success feedback
        setGenerateSuccess(true);
        setTimeout(() => setGenerateSuccess(false), 3000);
      } else {
        // Use fallback data if API fails
        const fallbackData =
          result.data || generateMockAIResponse(selectedText);
        setNewVocab((prev) => ({
          ...prev,
          hiragana: fallbackData.hiragana,
          definition: fallbackData.definition,
          example: fallbackData.example,
          translation: fallbackData.translation,
        }));

        console.warn("AI Generate failed, using fallback:", result.error);
      }
    } catch (error) {
      console.error("AI Generate failed:", error);

      // Use mock data as fallback
      const fallbackData = generateMockAIResponse(selectedText);
      setNewVocab((prev) => ({
        ...prev,
        hiragana: fallbackData.hiragana,
        definition: fallbackData.definition,
        example: fallbackData.example,
        translation: fallbackData.translation,
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock AI response generator
  const generateMockAIResponse = (word: string) => {
    // Đây là mock response, trong thực tế sẽ thay bằng API call tới AI service
    const responses: { [key: string]: any } = {
      今日: {
        hiragana: "きょう",
        definition: "hôm nay",
        example: "今日は暑いです。",
        translation: "Hôm nay trời nóng.",
      },
      昨日: {
        hiragana: "きのう",
        definition: "hôm qua",
        example: "昨日映画を見ました。",
        translation: "Hôm qua tôi đã xem phim.",
      },
      明日: {
        hiragana: "あした",
        definition: "ngày mai",
        example: "明日学校に行きます。",
        translation: "Ngày mai tôi sẽ đi học.",
      },
      学校: {
        hiragana: "がっこう",
        definition: "trường học",
        example: "学校で勉強します。",
        translation: "Tôi học ở trường.",
      },
      勉強: {
        hiragana: "べんきょう",
        definition: "học tập",
        example: "日本語を勉強します。",
        translation: "Tôi học tiếng Nhật.",
      },
    };

    // Return specific response if available, otherwise generate generic one
    if (responses[word]) {
      return responses[word];
    }

    // Generic response for unknown words
    return {
      hiragana: "よみかた", // placeholder
      definition: "nghĩa của từ",
      example: `${word}を使います。`,
      translation: `Sử dụng ${word}.`,
    };
  };

  const getLevelColor = (level?: string) => {
    const colors = {
      N5: "bg-blue-100 text-blue-800",
      N4: "bg-green-100 text-green-800",
      N3: "bg-yellow-100 text-yellow-800",
      N2: "bg-orange-100 text-orange-800",
      N1: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}

      {/* Tooltip */}
      {showTooltip && tooltipPosition && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 pointer-events-auto transition-all duration-200 ease-out ${
            showAddDialog ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: tooltipPosition.transform || "translate(-50%, -100%)",
          }}
        >
          <Card className="w-80 shadow-xl border-2 bg-white animate-in fade-in-0 zoom-in-95 duration-200 relative">
            {/* Arrow pointer */}
            <div
              className={`absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45 ${
                tooltipPosition.transform?.includes("-100%, 0") ||
                tooltipPosition.transform?.includes("-50%, 0") ||
                tooltipPosition.transform?.includes("translateY(0)")
                  ? "top-[-6px] left-1/2 -translate-x-1/2" // Arrow on top when tooltip is below
                  : "bottom-[-6px] left-1/2 -translate-x-1/2" // Arrow on bottom when tooltip is above
              }`}
            />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span
                    className="font-bold"
                    style={{
                      fontFamily:
                        "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                    }}
                  >
                    {selectedText}
                  </span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTooltip(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">
                    Đang tìm kiếm...
                  </span>
                </div>
              ) : foundVocab ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="text-lg font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded"
                      style={{
                        fontFamily:
                          "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                      }}
                    >
                      {foundVocab.hiragana}
                    </div>
                    <div className="flex items-center gap-2">
                      {foundVocab.category?.level && (
                        <Badge
                          className={getLevelColor(foundVocab.category.level)}
                          variant="secondary"
                        >
                          {foundVocab.category.level}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-900 font-medium">
                      <span className="text-gray-600">Nghĩa:</span>{" "}
                      {foundVocab.definition}
                    </p>
                    {foundVocab.category && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Danh mục:</span>{" "}
                        {foundVocab.category.name} ({foundVocab.category.nameJp}
                        )
                      </p>
                    )}
                  </div>

                  {foundVocab.example && (
                    <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Ví dụ:
                      </p>
                      <p
                        className="text-gray-800"
                        style={{
                          fontFamily:
                            "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                        }}
                      >
                        {foundVocab.example}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Không tìm thấy từ vựng trong cơ sở dữ liệu
                  </p>
                  <Button
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700"
                    onMouseDown={(e) => {
                      handleAddVocabulary(e);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm từ vựng
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Vocabulary Dialog - Separate from tooltip */}
      <Dialog open={showAddDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Thêm từ vựng mới
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết cho từ vựng "{selectedText}"
            </DialogDescription>
          </DialogHeader>

          {/* Auto Generate Button */}
          <div className="flex flex-col items-center pb-4 border-b">
            <Button
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Auto Generate
                </>
              )}
            </Button>
            {generateSuccess && (
              <div className="flex items-center mt-2 text-sm text-green-600 animate-in fade-in-0 duration-300">
                <CheckCircle className="h-4 w-4 mr-1" />
                Tạo thành công!
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="kanji">Kanji</Label>
              <Input
                id="kanji"
                value={newVocab.kanji || ""}
                onChange={(e) =>
                  setNewVocab((prev) => ({
                    ...prev,
                    kanji: e.target.value,
                  }))
                }
                style={{
                  fontFamily:
                    "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                }}
              />
            </div>

            <div>
              <Label htmlFor="hiragana">Cách đọc (hiragana/katakana) *</Label>
              <Input
                id="hiragana"
                value={newVocab.hiragana}
                onChange={(e) =>
                  setNewVocab((prev) => ({
                    ...prev,
                    hiragana: e.target.value,
                  }))
                }
                placeholder="ví dụ: ともだち"
                disabled={isGenerating}
                className={isGenerating ? "opacity-50" : ""}
                style={{
                  fontFamily:
                    "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                }}
              />
              {isGenerating && (
                <div className="flex items-center mt-1 text-xs text-purple-600">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  AI đang tạo...
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="definition">Nghĩa tiếng Việt *</Label>
              <Input
                id="definition"
                value={newVocab.definition}
                onChange={(e) =>
                  setNewVocab((prev) => ({
                    ...prev,
                    definition: e.target.value,
                  }))
                }
                placeholder="ví dụ: bạn bè"
                disabled={isGenerating}
                className={isGenerating ? "opacity-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="category">Danh mục</Label>
              <select
                id="category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                disabled={isGenerating}
                className={`w-full p-2 border border-gray-300 rounded-md ${
                  isGenerating ? "opacity-50" : ""
                }`}
              >
                {loadedCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.nameJp}) - {category.level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="translation">Dịch nghĩa</Label>
              <Input
                id="translation"
                value={newVocab.translation || ""}
                onChange={(e) =>
                  setNewVocab((prev) => ({
                    ...prev,
                    translation: e.target.value,
                  }))
                }
                placeholder="ví dụ: Tôi đi cùng với bạn bè"
                disabled={isGenerating}
                className={isGenerating ? "opacity-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="example">Ví dụ</Label>
              <Textarea
                id="example"
                value={newVocab.example}
                onChange={(e) =>
                  setNewVocab((prev) => ({
                    ...prev,
                    example: e.target.value,
                  }))
                }
                placeholder="ví dụ: 友達と一緒に行きます。"
                disabled={isGenerating}
                className={isGenerating ? "opacity-50" : ""}
                style={{
                  fontFamily:
                    "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveVocabulary}
              disabled={!newVocab.hiragana || !newVocab.definition}
              className="bg-rose-600 hover:bg-rose-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu từ vựng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
