'use client';

import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function ParagraphItem({
  paragraph,
  isActive,
  isPaused,
  onPlay,
  onPause,
  onResume,
  checked,
  onCheckedChange,
}) {
  const handleClick = () => {
    if (isActive && !isPaused) {
      onPause();
    } else if (isActive && isPaused) {
      onResume();
    } else {
      onPlay(paragraph);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 bg-white rounded-xl shadow-sm border transition-all">
      {/* Checkbox */}
      <div className="flex items-start sm:pt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheckedChange}
          className="mt-1 sm:mt-0"
        />
      </div>

      {/* Paragraph Text */}
      <div className="flex-1 text-gray-700 text-sm sm:text-base leading-relaxed">
        {paragraph}
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={handleClick}
        className="text-[#D00000] hover:opacity-80 transition self-start"
        aria-label="Toggle paragraph read"
      >
        {isActive && !isPaused ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
