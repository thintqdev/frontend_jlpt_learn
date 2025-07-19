import type React from "react"

interface VocabularyWord {
  id: number
  english: string
  japanese: string
}

interface VocabularyListProps {
  words: VocabularyWord[]
}

const VocabularyList: React.FC<VocabularyListProps> = ({ words }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vocabulary List</h1>
      <ul>
        {words.map((word) => (
          <li key={word.id} className="mb-4 p-4 border rounded shadow-md">
            <div className="text-xl font-bold text-red-600 japanese-text">{word.japanese}</div>
            <div className="text-lg">{word.english}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default VocabularyList
