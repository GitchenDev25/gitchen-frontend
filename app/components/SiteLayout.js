'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  ClerkProvider,
  useUser,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export default function SiteLayout({ children }) {
  const { isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ClerkProvider>
      {/* Header */}
      <header className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/images/Frame 2.png"
              alt="Gitchen Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold text-[#D00000]">Gitchen</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-gray-700">
            {isSignedIn && (
              <Link href="/user/dashboard" className="hover:text-[#D00000]">Dashboard</Link>
            )}
            <Link href="/recipes" className="hover:text-[#D00000]">Browse</Link>
            <Link href="../not-found.js" className="hover:text-[#D00000]">Contact Us</Link>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton className="bg-[#D00000] text-white px-4 py-2 rounded text-sm hover:opacity-70 transition cursor-pointer" />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </nav>

          {/* Mobile Toggle */}
          <button className="md:hidden text-[#D00000]" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden bg-white border-t px-6 py-4">
            <nav className="flex flex-col gap-4 text-gray-700 font-medium">
              {isSignedIn && (
                <Link href="/user/dashboard" onClick={() => setIsOpen(false)} className="hover:text-[#D00000]">Dashboard</Link>
              )}
              <Link href="/recipes" onClick={() => setIsOpen(false)} className="hover:text-[#D00000]">Browse</Link>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-[#D00000]">Contact</Link>
              <div className="pt-2 border-t mt-2">
                <SignedOut>
                  <SignInButton className="text-sm text-[#D00000] underline" />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-[80px]">{children}</main>
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="no-print">
        {/* Footer */}
        <footer className="bg-[#111] text-[#eee] px-6 py-10 mt-10">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3 items-center text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-3">
              <Image
                src="/images/Frame 2.png"
                alt="Gitchen Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <h2 className="text-xl font-semibold">Gitchen</h2>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="../not-found.js" className="hover:underline">About Us</Link>
              <Link href="../not-found.js" className="hover:underline">Contact</Link>
              <Link href="../not-found.js" className="hover:underline">Terms & Conditions</Link>
              <Link href="../not-found.js" className="hover:underline">Privacy Policy</Link>
            </div>

            <div>
              <p>&copy; {new Date().getFullYear()} Gitchen. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

    </ClerkProvider>
  );
}
