// app/components/SocialShare.jsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Facebook, Mail, Share2, MessageCircleMore } from 'lucide-react';

export default function SocialShare() {
  const pathname = usePathname();
  const parts = pathname.split('/');
  const id = parts[parts.length - 1];

  const [shareUrl, setShareUrl] = useState('');
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const url = `${window.location.origin}/recipes/${id}`;
      setShareUrl(url);
      setCanShare(!!navigator.share); // Check Web Share API support
    }
  }, [id]);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: 'Check out this recipe!',
        url: shareUrl,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (!shareUrl) return null;

  const encodedUrl = encodeURIComponent(shareUrl);
  const text = encodeURIComponent('Check out this recipe!');

  return (
    <div className="flex flex-wrap gap-3 mt-6">

      {/* Web Share API Button (mobile-native) */}
      {canShare && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-3 py-2 bg-[#D00000] text-white rounded hover:bg-red-600 transition"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
      )}

      {/* Social fallback buttons */}
      <Link
        href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        <MessageCircleMore className="w-4 h-4" /> Post on X
      </Link>

      <Link
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
      >
        <Facebook className="w-4 h-4" /> Facebook
      </Link>

      <Link
        href={`https://wa.me/?text=${text}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        <Share2 className="w-4 h-4" /> WhatsApp
      </Link>

      <Link
        href={`mailto:?subject=${text}&body=${encodedUrl}`}
        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
      >
        <Mail className="w-4 h-4" /> Email
      </Link>
    </div>
  );
}
