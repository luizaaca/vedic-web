"use client";

import React from 'react';

interface JsonViewerProps {
  data: object;
}

const JsonNode = ({ nodeKey, nodeValue, level }: { nodeKey: string, nodeValue: any, level: number }) => {
  const isObject = typeof nodeValue === 'object' && nodeValue !== null && !Array.isArray(nodeValue);
  const isArray = Array.isArray(nodeValue);

  const keyStyle = "text-purple-600 font-semibold";
  const valueStyle = "text-green-700";
  const stringStyle = "text-amber-700";
  const nullStyle = "text-gray-500";

  if (isObject || isArray) {
    const entries = Object.entries(nodeValue);
    const summary = isArray ? `[${entries.length}]` : `{${entries.length}}`;
    return (
      <details open={level < 2} className="pl-4 border-l border-gray-200 my-1">
        <summary className="cursor-pointer select-none list-inside">
          <span className={keyStyle}>{nodeKey}:</span>
          <span className="text-gray-500 ml-2">{summary}</span>
        </summary>
        <div className="pl-4">
          {entries.map(([key, value]) => (
            <JsonNode key={key} nodeKey={key} nodeValue={value} level={level + 1} />
          ))}
        </div>
      </details>
    );
  }

  const renderValue = () => {
    if (typeof nodeValue === 'string') return <span className={stringStyle}>"{nodeValue}"</span>;
    if (nodeValue === null) return <span className={nullStyle}>null</span>;
    return <span className={valueStyle}>{String(nodeValue)}</span>;
  };

  return (
    <div className="pl-4 border-l border-gray-200 my-1">
      <span className={keyStyle}>{nodeKey}:</span> {renderValue()}
    </div>
  );
};

export const JsonViewer = ({ data }: JsonViewerProps) => {
  return (
    <div className="font-mono text-sm bg-gray-50 p-2 rounded-lg border border-gray-200 overflow-x-auto">
      {Object.entries(data).map(([key, value]) => (
        <JsonNode key={key} nodeKey={key} nodeValue={value} level={0} />
      ))}
    </div>
  );
};
