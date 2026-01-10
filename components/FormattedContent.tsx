
import React from 'react';

interface FormattedContentProps {
  content: string;
  className?: string;
}

const FormattedContent: React.FC<FormattedContentProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Split content into blocks (paragraphs, headers, lists)
  const lines = content.split('\n');
  const renderedBlocks: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      renderedBlocks.push(
        <ul key={`list-${renderedBlocks.length}`} className="list-disc ml-6 mb-4 space-y-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  const parseInline = (text: string) => {
    // Basic bold parsing: **text** or __text__
    const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      renderedBlocks.push(
        <h4 key={index} className="text-lg font-bold text-blue-800 mt-6 mb-2 border-b border-blue-100 pb-1">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      renderedBlocks.push(
        <h3 key={index} className="text-xl font-bold text-blue-900 mt-8 mb-3">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      flushList();
      renderedBlocks.push(
        <h2 key={index} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
    } 
    // Bullet points
    else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      currentList.push(
        <li key={index} className="text-gray-700 leading-relaxed">
          {parseInline(trimmed.slice(2))}
        </li>
      );
    } 
    // Empty line
    else if (trimmed === '') {
      flushList();
    } 
    // Normal text
    else {
      flushList();
      renderedBlocks.push(
        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }
  });

  flushList();

  return <div className={`formatted-content ${className}`}>{renderedBlocks}</div>;
};

export default FormattedContent;
