// Utility functions for loading vocabulary data
export async function loadCategories() {
  try {
    const response = await fetch("/data/categories.json")
    if (!response.ok) {
      throw new Error("Failed to fetch categories")
    }
    const data = await response.json()
    return data.categories
  } catch (error) {
    console.error("Error loading categories:", error)
    return []
  }
}

export async function loadCategoryWords(categoryId: string) {
  try {
    const response = await fetch(`/data/vocabulary/${categoryId}.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch words for category: ${categoryId}`)
    }
    const data = await response.json()
    return data.words
  } catch (error) {
    console.error(`Error loading words for category ${categoryId}:`, error)
    return []
  }
}

export async function loadCategoryWithWords(categoryId: string) {
  try {
    const [categories, words] = await Promise.all([loadCategories(), loadCategoryWords(categoryId)])

    const category = categories.find((cat: any) => cat.id === categoryId)
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`)
    }

    return {
      ...category,
      words,
    }
  } catch (error) {
    console.error(`Error loading category with words ${categoryId}:`, error)
    return null
  }
}

// Static data for backward compatibility (will be removed later)
export const vocabularyData = {
  categories: [
    {
      id: "family",
      name: "Gia đình",
      nameJp: "家族",
      level: "N5",
      description: "Từ vựng về các thành viên trong gia đình",
      words: [], // Will be loaded dynamically
    },
    {
      id: "food",
      name: "Đồ ăn",
      nameJp: "食べ物",
      level: "N5",
      description: "Từ vựng về các loại thức ăn và đồ uống",
      words: [],
    },
    {
      id: "school",
      name: "Trường học",
      nameJp: "学校",
      level: "N4",
      description: "Từ vựng về trường học và học tập",
      words: [],
    },
    {
      id: "colors",
      name: "Màu sắc",
      nameJp: "色",
      level: "N5",
      description: "Từ vựng về các màu sắc cơ bản",
      words: [],
    },
    {
      id: "numbers",
      name: "Số đếm",
      nameJp: "数字",
      level: "N5",
      description: "Từ vựng về các con số cơ bản",
      words: [],
    },
    {
      id: "time",
      name: "Thời gian",
      nameJp: "時間",
      level: "N4",
      description: "Từ vựng về thời gian và ngày tháng",
      words: [],
    },
    {
      id: "weather",
      name: "Thời tiết",
      nameJp: "天気",
      level: "N4",
      description: "Từ vựng về thời tiết và khí hậu",
      words: [],
    },
    {
      id: "body",
      name: "Cơ thể",
      nameJp: "体",
      level: "N4",
      description: "Từ vựng về các bộ phận cơ thể",
      words: [],
    },
    {
      id: "animals",
      name: "Động vật",
      nameJp: "動物",
      level: "N5",
      description: "Từ vựng về các loài động vật",
      words: [],
    },
    {
      id: "transportation",
      name: "Phương tiện",
      nameJp: "交通",
      level: "N4",
      description: "Từ vựng về các phương tiện giao thông",
      words: [],
    },
    {
      id: "work",
      name: "Công việc",
      nameJp: "仕事",
      level: "N3",
      description: "Từ vựng về công việc và nghề nghiệp",
      words: [],
    },
  ],
}
