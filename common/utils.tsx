import React from "react";

export function highlightGrammarInSentence(sentence: string): React.ReactNode {
  const regex = /\*(.*?)\*|_(.*?)_/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      parts.push(sentence.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(
        <span key={key++} className="font-bold text-red-600">
          {match[1]}
        </span>
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <span key={key++} className="underline">
          {match[2]}
        </span>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < sentence.length) {
    parts.push(sentence.slice(lastIndex));
  }
  return parts;
}

export function parseFurigana(sentence: string): React.ReactNode {
  const regex = /([\p{sc=Han}々〆ヵヶ]+)\(([^)]+)\)/gu;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      parts.push(sentence.slice(lastIndex, match.index));
    }
    parts.push(
      <ruby key={key++}>
        {match[1]}
        <rt style={{ fontSize: "0.7em" }}>{match[2]}</rt>
      </ruby>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < sentence.length) {
    parts.push(sentence.slice(lastIndex));
  }
  return parts;
}

export function renderExample(sentence: string): React.ReactNode {
  const highlighted = highlightGrammarInSentence(sentence);
  return React.Children.map(highlighted, (part, idx) => {
    if (typeof part === "string") {
      return <React.Fragment key={idx}>{parseFurigana(part)}</React.Fragment>;
    }
    return part;
  });
}
