'use client';

import Link from 'next/link';
import './not-found.css'; // Import custom styles

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Floating emojis */}
      <div className="absolute top-10 left-10 floating-emoji">🍕</div>
      <div className="absolute top-20 right-12 floating-emoji delay-2">🥗</div>
      <div className="absolute bottom-12 left-16 floating-emoji delay-3">🍳</div>
      <div className="absolute bottom-20 right-20 floating-emoji delay-1">🍜</div>

      <h1 className="text-7xl md:text-9xl font-extrabold text-[#D00000] animate-bounce">404</h1>
      <p className="text-xl md:text-2xl text-gray-700 mt-4 text-center max-w-xl">
        Uh-oh! You’ve wandered off the recipe page. This dish doesn’t exist.
      </p>

      <Link
        href="/"
        className="mt-8 inline-block bg-[#D00000] text-white text-lg px-6 py-3 rounded-lg shadow-lg floating-button hover:opacity-90 transition duration-300"
      >
        🏠 Back to Home
      </Link>
    </div>
  );
}
