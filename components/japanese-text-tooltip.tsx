"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
import {
  getDictionaryByDictionaryForm,
  smartLookup,
  createDictionary,
  type Dictionary,
  type DictionaryMeaning,
} from "@/lib/dictionary";

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
  vocabulary?: Dictionary[];
  categories?: Category[];
  onAddVocabulary?: (vocab: Dictionary) => void;
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
  const [foundVocab, setFoundVocab] = useState<Dictionary | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [preventClose, setPreventClose] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form states for adding new vocabulary
  const [newVocab, setNewVocab] = useState({
    word: "",
    reading: "",
    type: "noun",
    level: "N5",
  });

  // New state for multiple meanings
  const [meanings, setMeanings] = useState<
    Array<{ meaning: string; example: string; translation: string }>
  >([{ meaning: "", example: "", translation: "" }]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    categories[0]?.id || 5
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

  // Load categories if not provided (for add vocabulary feature)
  useEffect(() => {
    if (
      categories.length === 0 &&
      !hasLoadedCategories.current &&
      !isLoadingCategories
    ) {
      setIsLoadingCategories(true);
      hasLoadedCategories.current = true;

      // Temporarily disabled - categories will be loaded when needed
      // If you need categories for add vocabulary, uncomment this
      /*
      fetchShortCategories()
        .then((data: any) => {
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
            level: item.level,
            description: item.description,
          }));
          setLoadedCategories(mappedCategories);
          if (mappedCategories.length > 0) {
            setSelectedCategoryId(mappedCategories[0].id);
          }
        })
        .catch((error: any) => {
          console.error("Failed to load categories:", error);
          hasLoadedCategories.current = false;
        })
        .finally(() => {
          setIsLoadingCategories(false);
        });
      */
      setIsLoadingCategories(false);
    }
  }, []); // Empty dependency array - only run once on mount

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isAddingVocab = useRef(false);

  // Set mounted state for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Function to search vocabulary in database using API
  const searchVocabulary = useCallback(
    async (text: string): Promise<Dictionary | null> => {
      try {
        // Use getDictionaryByDictionaryForm to find the word
        const dictionaries = await getDictionaryByDictionaryForm(text);

        if (dictionaries && dictionaries.length > 0) {
          return dictionaries[0];
        }

        // Fallback to local search if API returns empty
        const allVocab = [...vocabulary];
        const localFound = allVocab.find(
          (item) => item.word === text || item.reading === text
        );

        return localFound || null;
      } catch (error) {
        console.error("Error searching vocabulary:", error);

        // Fallback to local search if API fails
        const allVocab = [...vocabulary];
        let found = allVocab.find(
          (item) => item.word === text || item.reading === text
        );

        // If not found, try partial matches
        if (!found) {
          found = allVocab.find(
            (item) =>
              text.includes(item.word) ||
              item.word.includes(text) ||
              text.includes(item.reading) ||
              item.reading.includes(text)
          );
        }

        return found || null;
      }
    },
    [vocabulary]
  );

  // Calculate optimal tooltip position - simple: above or below
  const calculateTooltipPosition = useCallback((rect: DOMRect) => {
    const tooltipWidth = 320; // w-80 = 320px
    const tooltipHeight = 400; // max height with scroll
    const gap = 12; // gap between tooltip and selected text
    const margin = 16; // margin from viewport edges

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Use absolute positioning with pageX/pageY (includes scroll)
    const pageX = rect.left + window.scrollX;
    const pageY = rect.top + window.scrollY;

    // Center horizontally on the selected text
    let x = pageX + rect.width / 2;
    let y = pageY - gap;
    let transform = "translate(-50%, -100%)";

    // Check if tooltip would overflow horizontally
    const leftEdge = rect.left + rect.width / 2 - tooltipWidth / 2;
    const rightEdge = rect.left + rect.width / 2 + tooltipWidth / 2;

    // Adjust horizontal position if overflowing
    if (leftEdge < margin) {
      // Too close to left edge - align to left with margin
      x = pageX - rect.left + margin + tooltipWidth / 2;
    } else if (rightEdge > viewportWidth - margin) {
      // Too close to right edge - align to right with margin
      x = pageX - rect.left + viewportWidth - margin - tooltipWidth / 2;
    }

    // Check vertical space
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;

    // Priority: show above if enough space, otherwise show below
    if (spaceAbove >= tooltipHeight + gap + margin) {
      // Show above
      y = pageY - gap;
      transform = "translate(-50%, -100%)";
    } else if (spaceBelow >= tooltipHeight + gap + margin) {
      // Show below
      y = pageY + rect.height + gap;
      transform = "translate(-50%, 0)";
    } else if (spaceAbove > spaceBelow) {
      // Show above even if not enough space (better than below)
      y = pageY - gap;
      transform = "translate(-50%, -100%)";
    } else {
      // Show below
      y = pageY + rect.height + gap;
      transform = "translate(-50%, 0)";
    }

    return {
      x,
      y,
      transform,
    };
  }, []);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    // Don't trigger selection when dialog is open
    if (showAddDialog) return;

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
  }, [searchVocabulary, calculateTooltipPosition, showAddDialog]);

  // Handle click outside to close tooltip
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      // Don't close if dialog is open, about to open, or if we're adding vocab
      if (showAddDialog || preventClose || isAddingVocab.current) return;

      // Check if click is inside dialog (for portal compatibility)
      const target = event.target as HTMLElement;
      if (target.closest('[role="dialog"]')) {
        return;
      }

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
    // Wrapper to check if event is from dialog before processing
    const handleMouseUp = (e: MouseEvent) => {
      // Ignore mouseup from dialog
      const target = e.target as HTMLElement;
      if (target.closest('[role="dialog"]')) {
        return;
      }
      handleTextSelection();
    };

    document.addEventListener("mouseup", handleMouseUp);
    // Use setTimeout to delay the click listener attachment
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("scroll", handleWindowResize);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mouseup", handleMouseUp);
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
      word: selectedText,
      reading: "",
      type: "noun",
      level: "N5",
    });
    setMeanings([{ meaning: "", example: "", translation: "" }]);
    setGenerateSuccess(false);

    // Set dialog to open
    setShowAddDialog(true);

    // Reset flag after dialog is definitely open
    setTimeout(() => {
      isAddingVocab.current = false;
    }, 200);
  };

  const handleSaveVocabulary = async () => {
    if (!newVocab.reading || meanings.length === 0 || !meanings[0].meaning) {
      return;
    }

    // Prevent tooltip from closing during save
    setPreventClose(true);
    setIsLoading(true);

    try {
      // Filter out empty meanings
      const validMeanings = meanings.filter((m) => m.meaning.trim().length > 0);

      if (validMeanings.length === 0) {
        alert("Vui lòng nhập ít nhất một nghĩa!");
        setIsLoading(false);
        setPreventClose(false);
        return;
      }

      // Prepare data for Dictionary API
      const dictionaryData = {
        word: newVocab.word || selectedText,
        reading: newVocab.reading,
        meanings: validMeanings.map((m) => ({
          meaning: m.meaning.trim(),
          example: m.example.trim() || "",
          translation: m.translation.trim() || "",
        })),
        type: newVocab.type || "noun",
        level: newVocab.level || "N5",
      };

      // Call createDictionary API
      const result = await createDictionary(dictionaryData);

      // Pass the result directly as it's already a Dictionary type
      onAddVocabulary?.(result);

      // Show success message
      setGenerateSuccess(true);
      setTimeout(() => {
        setShowAddDialog(false);
        setShowTooltip(false);
        setGenerateSuccess(false);
        setPreventClose(false);
      }, 1500);

      // Reset form
      setNewVocab({
        word: "",
        reading: "",
        type: "noun",
        level: "N5",
      });
      setMeanings([{ meaning: "", example: "", translation: "" }]);
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      alert("Có lỗi xảy ra khi lưu từ vựng. Vui lòng thử lại!");
      setPreventClose(false);
    } finally {
      setIsLoading(false);
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
        setNewVocab((prev: typeof newVocab) => ({
          ...prev,
          reading: result.data.hiragana,
          type: result.data.type || "noun",
        }));

        // Set meanings array
        if (result.data.meanings && Array.isArray(result.data.meanings)) {
          setMeanings(result.data.meanings);
        }

        // Show success feedback
        setGenerateSuccess(true);
        setTimeout(() => setGenerateSuccess(false), 3000);
      } else {
        // Use fallback data if API fails
        console.warn("AI Generate failed, using fallback:", result.error);
      }
    } catch (error) {
      console.error("AI Generate failed:", error);
    } finally {
      setIsGenerating(false);
    }
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

      {/* Tooltip - Rendered via Portal */}
      {mounted &&
        showTooltip &&
        tooltipPosition &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`absolute z-50 pointer-events-auto transition-all duration-200 ease-out ${
              showAddDialog ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: tooltipPosition.transform || "translate(-50%, -100%)",
            }}
          >
            <Card className="w-80 shadow-xl border-2 bg-white animate-in fade-in-0 zoom-in-95 duration-200 relative max-h-[70vh] flex flex-col">
              {/* Arrow pointer */}
              <div
                className={`absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45 ${
                  tooltipPosition.transform?.includes("translate(-50%, 0)")
                    ? "top-[-6px] left-1/2 -translate-x-1/2" // Arrow on top when tooltip is below
                    : "bottom-[-6px] left-1/2 -translate-x-1/2" // Arrow on bottom when tooltip is above
                }`}
              />
              <CardHeader className="pb-2 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
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
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-3 overflow-y-auto flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-gray-600">
                      Đang tìm kiếm...
                    </span>
                  </div>
                ) : foundVocab ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div
                        className="text-base font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded"
                        style={{
                          fontFamily:
                            "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                        }}
                      >
                        {foundVocab.reading}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {foundVocab.level && (
                          <Badge
                            className={getLevelColor(foundVocab.level)}
                            variant="secondary"
                          >
                            {foundVocab.level}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {foundVocab.type}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium mb-1.5 text-xs">
                        Nghĩa:
                      </p>
                      <div className="space-y-2">
                        {foundVocab.meanings.map(
                          (meaningObj: DictionaryMeaning, index: number) => {
                            return (
                              <div key={index} className="ml-1.5">
                                <div className="flex items-start gap-1.5">
                                  <span className="text-blue-600 font-medium mt-0.5 text-sm">
                                    •
                                  </span>
                                  <div className="flex-1 space-y-1">
                                    <p className="text-gray-900 font-medium text-sm">
                                      {meaningObj.meaning}
                                    </p>
                                    {meaningObj.example && (
                                      <div className="pl-2.5 border-l-2 border-blue-200 bg-blue-50 py-1 px-2 rounded-r space-y-0.5">
                                        <p
                                          className="text-xs text-gray-800"
                                          style={{
                                            fontFamily:
                                              "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                                          }}
                                        >
                                          {meaningObj.example}
                                        </p>
                                        {meaningObj.translation && (
                                          <p className="text-xs text-gray-600 italic">
                                            → {meaningObj.translation}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <Search className="h-7 w-7 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-2">
                      Không tìm thấy từ vựng trong cơ sở dữ liệu
                    </p>
                    <Button
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700 h-8 text-xs"
                      onMouseDown={(e) => {
                        handleAddVocabulary(e);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Thêm từ vựng
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>,
          document.body
        )}

      {/* Add Vocabulary Dialog - Separate from tooltip */}
      <Dialog open={showAddDialog} onOpenChange={handleDialogClose}>
        <DialogContent
          className="sm:max-w-md max-h-[85vh] flex flex-col p-0"
          onPointerDownOutside={(e) => {
            // Prevent dialog from closing when clicking outside during operations
            if (isLoading || isGenerating) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" />
              Thêm từ vựng mới
            </DialogTitle>
            <DialogDescription className="text-sm">
              "{selectedText}"
            </DialogDescription>
          </DialogHeader>

          {/* Auto Generate Button */}
          <div className="flex flex-col items-center px-6 pb-3 border-b shrink-0">
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
              <div className="flex items-center mt-1.5 text-xs text-green-600 animate-in fade-in-0 duration-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Tạo thành công!
              </div>
            )}
          </div>

          {/* Scrollable Form Content */}
          <div className="overflow-y-auto px-6 py-3 space-y-3 flex-1">
            <div>
              <Label htmlFor="word" className="text-xs font-medium">
                Kanji
              </Label>
              <Input
                id="word"
                value={newVocab.word || ""}
                onChange={(e) =>
                  setNewVocab((prev: typeof newVocab) => ({
                    ...prev,
                    word: e.target.value,
                  }))
                }
                className="h-9 text-sm"
                style={{
                  fontFamily:
                    "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                }}
              />
            </div>

            <div>
              <Label htmlFor="reading" className="text-xs font-medium">
                Cách đọc *
              </Label>
              <Input
                id="reading"
                value={newVocab.reading}
                onChange={(e) =>
                  setNewVocab((prev: typeof newVocab) => ({
                    ...prev,
                    reading: e.target.value,
                  }))
                }
                placeholder="ví dụ: ともだち"
                disabled={isGenerating}
                className={`h-9 text-sm ${isGenerating ? "opacity-50" : ""}`}
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="type" className="text-xs font-medium">
                  Loại từ
                </Label>
                <select
                  id="type"
                  value={newVocab.type || "noun"}
                  onChange={(e) =>
                    setNewVocab((prev: typeof newVocab) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  disabled={isGenerating}
                  className={`w-full h-9 px-3 text-sm border border-gray-300 rounded-md ${
                    isGenerating ? "opacity-50" : ""
                  }`}
                >
                  <option value="noun">Danh từ</option>
                  <option value="verb">Động từ</option>
                  <option value="adjective">Tính từ</option>
                  <option value="adverb">Phó từ</option>
                  <option value="particle">Trợ từ</option>
                  <option value="expression">Thành ngữ</option>
                </select>
              </div>

              <div>
                <Label htmlFor="level" className="text-xs font-medium">
                  Cấp độ
                </Label>
                <select
                  id="level"
                  value={newVocab.level || "N5"}
                  onChange={(e) =>
                    setNewVocab((prev: typeof newVocab) => ({
                      ...prev,
                      level: e.target.value,
                    }))
                  }
                  disabled={isGenerating}
                  className={`w-full h-9 px-3 text-sm border border-gray-300 rounded-md ${
                    isGenerating ? "opacity-50" : ""
                  }`}
                >
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                  <option value="N1">N1</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs font-medium">Nghĩa *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMeanings([
                      ...meanings,
                      { meaning: "", example: "", translation: "" },
                    ])
                  }
                  disabled={isGenerating}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm
                </Button>
              </div>

              <div className="space-y-2.5">
                {meanings.map((item, index) => (
                  <div
                    key={index}
                    className="border p-3 rounded-md bg-gray-50/50 relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">
                        Nghĩa {index + 1}
                      </span>
                      {meanings.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setMeanings(meanings.filter((_, i) => i !== index))
                          }
                          disabled={isGenerating}
                          className="h-5 w-5 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`meaning-${index}`} className="text-xs">
                          Nghĩa *
                        </Label>
                        <Input
                          id={`meaning-${index}`}
                          value={item.meaning}
                          onChange={(e) => {
                            const newMeanings = [...meanings];
                            newMeanings[index].meaning = e.target.value;
                            setMeanings(newMeanings);
                          }}
                          placeholder="bạn bè"
                          disabled={isGenerating}
                          className={`h-8 text-sm ${
                            isGenerating ? "opacity-50" : ""
                          }`}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`example-${index}`} className="text-xs">
                          Ví dụ
                        </Label>
                        <Input
                          id={`example-${index}`}
                          value={item.example}
                          onChange={(e) => {
                            const newMeanings = [...meanings];
                            newMeanings[index].example = e.target.value;
                            setMeanings(newMeanings);
                          }}
                          placeholder="友達と遊びます。"
                          disabled={isGenerating}
                          className={`h-8 text-sm ${
                            isGenerating ? "opacity-50" : ""
                          }`}
                          style={{
                            fontFamily:
                              "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                          }}
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor={`translation-${index}`}
                          className="text-xs"
                        >
                          Dịch nghĩa
                        </Label>
                        <Input
                          id={`translation-${index}`}
                          value={item.translation}
                          onChange={(e) => {
                            const newMeanings = [...meanings];
                            newMeanings[index].translation = e.target.value;
                            setMeanings(newMeanings);
                          }}
                          placeholder="Chơi với bạn bè"
                          disabled={isGenerating}
                          className={`h-8 text-sm ${
                            isGenerating ? "opacity-50" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-end gap-2 px-6 py-3 border-t bg-gray-50/50 shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isLoading}
              className="h-9"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveVocabulary}
              disabled={
                !newVocab.reading ||
                meanings.length === 0 ||
                !meanings[0].meaning ||
                isLoading
              }
              className="bg-rose-600 hover:bg-rose-700 h-9"
              onMouseDown={(e) => {
                // Prevent any interference from tooltip click handlers
                e.stopPropagation();
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
