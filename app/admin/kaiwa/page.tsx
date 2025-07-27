"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Save,
  X,
  Trash2,
  Edit,
  Upload,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  fetchConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  createConversationJson, // <-- Thêm import này!
  Conversation,
  CreateConversationInput,
} from "@/lib/conversation";
import AdminNav from "@/components/admin-nav";

interface ConversationLine {
  id: number;
  speaker: string;
  jp: string;
  romaji: string;
  vi: string;
}

interface KaiwaPoint {
  id: number;
  title: string;
  level: string;
  category: string;
  duration: string;
  conversation: ConversationLine[];
}

export default function KaiwaAdminPage() {
  const [kaiwaList, setKaiwaList] = useState<KaiwaPoint[]>([]);
  const [selectedKaiwaId, setSelectedKaiwaId] = useState<number | null>(null);
  const [showAddKaiwa, setShowAddKaiwa] = useState(false);
  const [isAddingKaiwa, setIsAddingKaiwa] = useState(false);
  const [newKaiwa, setNewKaiwa] = useState({
    title: "",
    level: "N5",
    category: "",
    duration: "",
  });
  const [showAddConversation, setShowAddConversation] = useState(false);
  const [isAddingConversation, setIsAddingConversation] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<
    number | null
  >(null);
  const [conversationForm, setConversationForm] = useState({
    speaker: "A",
    jp: "",
    romaji: "",
    vi: "",
  });
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Search & sort
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  // Fetch conversations on mount and when search/sort changes
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const conversations = await fetchConversations({ search, sort });
        setKaiwaList(
          conversations.map((conv: Conversation) => ({
            id: conv.id,
            title: conv.title,
            level: conv.level,
            category: conv.category,
            duration: conv.duration ?? "5 phút",
            conversation: Array.isArray(conv.conversation)
              ? conv.conversation
              : [],
          }))
        );
      } catch (error) {
        console.error("Error fetching conversations:", error);
        alert("Lỗi khi tải danh sách hội thoại");
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [search, sort]);

  // Thêm kaiwa mới
  const handleAddKaiwa = async () => {
    if (!newKaiwa.title || !newKaiwa.category) {
      alert("Vui lòng nhập tên bài hội thoại và danh mục");
      return;
    }
    setIsAddingKaiwa(true);

    try {
      const input: CreateConversationInput = {
        ...newKaiwa,
        duration: newKaiwa.duration || "5 phút",
        conversation: [],
      };
      const newConversation = await createConversation(input);
      setKaiwaList([
        ...kaiwaList,
        {
          id: newConversation.id,
          title: newConversation.title,
          level: newConversation.level,
          category: newConversation.category,
          duration: newConversation.duration ?? "5 phút",
          conversation: Array.isArray(newConversation.conversation)
            ? newConversation.conversation
            : [],
        },
      ]);
      setNewKaiwa({ title: "", level: "N5", category: "", duration: "" });
      setShowAddKaiwa(false);
    } catch (error) {
      console.error("Error adding kaiwa:", error);
      alert("Lỗi khi thêm bài hội thoại");
    } finally {
      setIsAddingKaiwa(false);
    }
  };

  // Xoá kaiwa
  const handleDeleteKaiwa = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá bài hội thoại này?")) return;
    try {
      await deleteConversation(id);
      setKaiwaList(kaiwaList.filter((k) => k.id !== id));
      if (selectedKaiwaId === id) setSelectedKaiwaId(null);
    } catch (error) {
      console.error("Error deleting kaiwa:", error);
      alert("Lỗi khi xoá bài hội thoại");
    }
  };

  // Thêm hoặc sửa conversation line
  const handleSaveConversation = async () => {
    if (!conversationForm.jp || !conversationForm.vi) {
      alert("Vui lòng nhập câu tiếng Nhật và nghĩa tiếng Việt");
      return;
    }
    setIsAddingConversation(true);

    try {
      const selectedKaiwa = kaiwaList.find((k) => k.id === selectedKaiwaId);
      if (!selectedKaiwa) return;

      let updatedConversation: ConversationLine[];
      if (editingConversationId) {
        // Edit existing line
        updatedConversation = selectedKaiwa.conversation.map((line) =>
          line.id === editingConversationId
            ? { ...line, ...conversationForm }
            : line
        );
      } else {
        // Add new line
        const newId =
          selectedKaiwa.conversation.length > 0
            ? Math.max(...selectedKaiwa.conversation.map((c) => c.id)) + 1
            : 1;
        updatedConversation = [
          ...selectedKaiwa.conversation,
          { id: newId, ...conversationForm },
        ];
      }

      const input: Partial<CreateConversationInput> = {
        conversation: updatedConversation,
      };

      const updatedKaiwa = await updateConversation(selectedKaiwaId!, input);
      setKaiwaList((prev) =>
        prev.map((k) =>
          k.id === selectedKaiwaId
            ? {
                ...k,
                conversation: Array.isArray(updatedKaiwa.conversation)
                  ? updatedKaiwa.conversation
                  : [],
              }
            : k
        )
      );
      setConversationForm({ speaker: "A", jp: "", romaji: "", vi: "" });
      setShowAddConversation(false);
      setEditingConversationId(null);
    } catch (error) {
      console.error("Error saving conversation line:", error);
      alert("Lỗi khi lưu dòng hội thoại");
    } finally {
      setIsAddingConversation(false);
    }
  };

  // Xoá conversation line
  const handleDeleteConversation = async (lineId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá dòng hội thoại này?")) return;
    try {
      const selectedKaiwa = kaiwaList.find((k) => k.id === selectedKaiwaId);
      if (!selectedKaiwa) return;

      const updatedConversation = selectedKaiwa.conversation.filter(
        (line) => line.id !== lineId
      );
      const input: Partial<CreateConversationInput> = {
        conversation: updatedConversation,
      };

      const updatedKaiwa = await updateConversation(selectedKaiwaId!, input);
      setKaiwaList((prev) =>
        prev.map((k) =>
          k.id === selectedKaiwaId
            ? {
                ...k,
                conversation: Array.isArray(updatedKaiwa.conversation)
                  ? updatedKaiwa.conversation
                  : [],
              }
            : k
        )
      );
    } catch (error) {
      console.error("Error deleting conversation line:", error);
      alert("Lỗi khi xoá dòng hội thoại");
    }
  };

  // Import JSON kaiwa (sử dụng mutation createConversationJson cho import hàng loạt)
  const handleImportJSON = async () => {
    if (!importText.trim()) {
      alert("Vui lòng nhập dữ liệu JSON");
      return;
    }

    setIsImporting(true);
    try {
      const data = JSON.parse(importText);

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu phải là một mảng các kaiwa");
      }

      for (const kaiwa of data) {
        if (
          !kaiwa.title ||
          !kaiwa.level ||
          !kaiwa.category ||
          !Array.isArray(kaiwa.conversation)
        ) {
          throw new Error(
            "Mỗi kaiwa phải có: title, level, category, conversation"
          );
        }

        for (const line of kaiwa.conversation) {
          if (!line.speaker || !line.jp || !line.vi) {
            throw new Error("Mỗi dòng hội thoại phải có: speaker, jp, vi");
          }
        }
      }

      // Gọi mutation import hàng loạt
      await createConversationJson(JSON.stringify(data));
      // Reload lại danh sách kaiwa sau khi import
      const conversations = await fetchConversations({ search, sort });
      setKaiwaList(
        conversations.map((conv: Conversation) => ({
          id: conv.id,
          title: conv.title,
          level: conv.level,
          category: conv.category,
          duration: conv.duration ?? "5 phút",
          conversation: Array.isArray(conv.conversation)
            ? conv.conversation
            : [],
        }))
      );

      setImportText("");
      setShowImportModal(false);
      alert(`Đã import thành công ${data.length} bài kaiwa!`);
    } catch (error: any) {
      console.error("Error importing JSON:", error);
      alert(`Lỗi import: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Export JSON kaiwa
  const handleExportJSON = () => {
    if (kaiwaList.length === 0) {
      alert("Không có dữ liệu để export");
      return;
    }

    const exportData = kaiwaList.map((kaiwa) => ({
      title: kaiwa.title,
      level: kaiwa.level,
      category: kaiwa.category,
      duration: kaiwa.duration,
      conversation: kaiwa.conversation.map((line) => ({
        speaker: line.speaker,
        jp: line.jp,
        romaji: line.romaji,
        vi: line.vi,
      })),
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kaiwa-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedKaiwa = kaiwaList.find((k) => k.id === selectedKaiwaId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        <AdminNav />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin | Hội thoại tiếng Nhật (Kaiwa)
          </h1>
          <p className="text-gray-600">
            Quản lý các bài hội thoại tiếng Nhật với romaji và bản dịch tiếng
            Việt.
          </p>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setShowImportModal(true)}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import JSON
            </Button>
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
              disabled={kaiwaList.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>

          {/* Search & Sort UI */}
          <div className="flex gap-2 mt-6 items-center">
            <div className="flex items-center bg-white border rounded px-2 py-1 w-full max-w-md">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <Input
                className="border-none outline-none shadow-none p-0"
                placeholder="Tìm bài hội thoại theo tên..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearch(searchInput);
                }}
              />
              {search && (
                <Button
                  size="default"
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                  }}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="ml-2"
                onClick={() => setSearch(searchInput)}
                disabled={!searchInput}
              >
                Tìm
              </Button>
            </div>
            <div className="flex items-center ml-2">
              <span className="mr-1 text-sm text-gray-600">Sắp xếp:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
                className="px-2"
              >
                {sort === "asc" ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Cũ nhất
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Mới nhất
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bài hội thoại</CardTitle>
                  <CardDescription>
                    Quản lý các bài hội thoại Kaiwa
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddKaiwa(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Thêm bài hội thoại
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddKaiwa && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-3">Thêm bài hội thoại mới</h3>
                  <div className="space-y-3 max-h-screen overflow-y-auto">
                    <Input
                      placeholder="Tên bài hội thoại (ví dụ: Đi mua sắm)"
                      value={newKaiwa.title}
                      onChange={(e) =>
                        setNewKaiwa({ ...newKaiwa, title: e.target.value })
                      }
                    />
                    <select
                      className="w-full p-2 border rounded"
                      value={newKaiwa.level}
                      onChange={(e) =>
                        setNewKaiwa({ ...newKaiwa, level: e.target.value })
                      }
                    >
                      <option value="N5">N5</option>
                      <option value="N4">N4</option>
                      <option value="N3">N3</option>
                      <option value="N2">N2</option>
                      <option value="N1">N1</option>
                    </select>
                    <Input
                      placeholder="Danh mục (ví dụ: Mua sắm)"
                      value={newKaiwa.category}
                      onChange={(e) =>
                        setNewKaiwa({ ...newKaiwa, category: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Thời lượng (ví dụ: 3 phút)"
                      value={newKaiwa.duration}
                      onChange={(e) =>
                        setNewKaiwa({ ...newKaiwa, duration: e.target.value })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddKaiwa}
                        size="sm"
                        disabled={isAddingKaiwa}
                      >
                        {isAddingKaiwa ? (
                          <span className="animate-spin mr-2">
                            <Save className="h-4 w-4" />
                          </span>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {isAddingKaiwa ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddKaiwa(false)}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" /> Huỷ
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-screen overflow-y-auto">
                {kaiwaList.map((k) => (
                  <div
                    key={k.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedKaiwaId === k.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedKaiwaId(k.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{k.title}</h3>
                        <div className="flex gap-2 items-center text-sm text-gray-600 mt-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {k.level}
                          </span>
                          <span>{k.category}</span>
                          <span>•</span>
                          <span>{k.duration}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {k.conversation.length} dòng hội thoại
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteKaiwa(k.id);
                        }}
                        title="Xoá bài hội thoại"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedKaiwa
                      ? `Kaiwa: ${selectedKaiwa.title}`
                      : "Chi tiết bài hội thoại"}
                  </CardTitle>
                  <CardDescription>
                    {selectedKaiwa
                      ? "Quản lý nội dung hội thoại"
                      : "Chọn bài hội thoại để xem chi tiết"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedKaiwa ? (
                <>
                  {showAddConversation && (
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-medium mb-3">
                        {editingConversationId
                          ? "Sửa dòng hội thoại"
                          : "Thêm dòng hội thoại mới"}
                      </h3>
                      <div className="space-y-3 max-h-screen overflow-y-auto">
                        <select
                          className="w-full p-2 border rounded"
                          value={conversationForm.speaker}
                          onChange={(e) =>
                            setConversationForm({
                              ...conversationForm,
                              speaker: e.target.value,
                            })
                          }
                        >
                          <option value="A">Người nói A</option>
                          <option value="B">Người nói B</option>
                          <option value="C">Người nói C</option>
                          <option value="D">Người nói D</option>
                        </select>
                        <Textarea
                          placeholder="Câu tiếng Nhật"
                          value={conversationForm.jp}
                          onChange={(e) =>
                            setConversationForm({
                              ...conversationForm,
                              jp: e.target.value,
                            })
                          }
                          rows={2}
                        />
                        <Input
                          placeholder="Romaji (không bắt buộc)"
                          value={conversationForm.romaji}
                          onChange={(e) =>
                            setConversationForm({
                              ...conversationForm,
                              romaji: e.target.value,
                            })
                          }
                        />
                        <Textarea
                          placeholder="Dịch nghĩa tiếng Việt"
                          value={conversationForm.vi}
                          onChange={(e) =>
                            setConversationForm({
                              ...conversationForm,
                              vi: e.target.value,
                            })
                          }
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveConversation}
                            size="sm"
                            disabled={isAddingConversation}
                          >
                            {isAddingConversation ? (
                              <span className="animate-spin mr-2">
                                <Save className="h-4 w-4" />
                              </span>
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            {isAddingConversation ? "Đang lưu..." : "Lưu"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddConversation(false);
                              setEditingConversationId(null);
                              setConversationForm({
                                speaker: "A",
                                jp: "",
                                romaji: "",
                                vi: "",
                              });
                            }}
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" /> Huỷ
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedKaiwa.conversation.length === 0 && (
                      <div className="text-gray-500 text-sm">
                        Chưa có dòng hội thoại nào cho bài này.
                      </div>
                    )}
                    {selectedKaiwa.conversation.map((line, idx) => (
                      <div
                        key={line.id ?? idx}
                        className={`p-4 border rounded-lg ${
                          line.speaker === "A"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  line.speaker === "A"
                                    ? "bg-blue-200 text-blue-800"
                                    : "bg-green-200 text-green-800"
                                }`}
                              >
                                {line.speaker}
                              </span>
                              <span className="text-xs text-gray-500">
                                Dòng {idx + 1}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="font-medium text-lg">
                                {line.jp}
                              </div>
                              {line.romaji && (
                                <div className="text-sm text-blue-700 italic">
                                  {line.romaji}
                                </div>
                              )}
                              <div className="text-sm text-gray-700">
                                {line.vi}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Chọn bài hội thoại để xem chi tiết và quản lý nội dung</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Import JSON Kaiwa</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportText("");
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Định dạng JSON mẫu:</h3>
                  <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                    <pre>{`[
  {
    "title": "Đi mua sắm",
    "level": "N5",
    "category": "Mua sắm", 
    "duration": "3 phút",
    "conversation": [
      {
        "speaker": "A",
        "jp": "これ、いくらですか。",
        "romaji": "Kore, ikura desu ka?",
        "vi": "Cái này bao nhiêu tiền vậy?"
      },
      {
        "speaker": "B", 
        "jp": "500円です。",
        "romaji": "Go-hyaku en desu.",
        "vi": "500 yên ạ."
      }
    ]
  }
]`}</pre>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Dán JSON data vào đây:
                  </label>
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Dán JSON data của các bài kaiwa..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>
                    <strong>Lưu ý:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Dữ liệu phải là mảng JSON hợp lệ</li>
                    <li>
                      Mỗi kaiwa cần có: title, level, category, conversation
                    </li>
                    <li>Mỗi dòng hội thoại cần có: speaker, jp, vi</li>
                    <li>Romaji và duration là tùy chọn</li>
                    <li>ID sẽ được tự động tạo</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportText("");
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleImportJSON}
                    disabled={isImporting || !importText.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isImporting ? (
                      <span className="animate-spin mr-2">
                        <Upload className="h-4 w-4" />
                      </span>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isImporting ? "Đang import..." : "Import"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
