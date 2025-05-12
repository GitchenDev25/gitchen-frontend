'use client';
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from 'next/navigation';


export default function CTASection() {
  //check if user is signed in
  const { isSignedIn } = useUser();

  const router = useRouter();

  const handleClick = () => {
    router.push('/recipes');
  };

  return (
    <section className="bg-[#D00000] text-white py-16 px-6 text-center">
      <h2 className="text-4xl font-bold mb-4">Ready to Cook Up Something Amazing?</h2>
      <p className="text-lg mb-8 max-w-xl mx-auto">
        Discover, save, and savor thousands of recipes. Whether you’re a beginner or a seasoned chef,
        Gitchen makes it easy to bring flavor to your table.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {!isSignedIn ? (
          <>
            <SignUpButton mode="modal">
              <button className="bg-white text-[#D00000] font-semibold px-6 py-3 rounded-md hover:opacity-90 transition">
                Sign Up
              </button>
            </SignUpButton>

            <SignInButton mode="modal">
              <button className="border border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-[#D00000] transition">
                Sign In
              </button>
            </SignInButton>

          </>
        ) : (
          <Link
            href="../user/dashboard"
            className="bg-white text-[#D00000] font-semibold px-6 py-3 rounded-md hover:opacity-90 transition"
            style={{ cursor: 'pointer' }}
          >
            Go to Dashboard
          </Link>
        )}
        <button className="border border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-[#D00000] transition" onClick={handleClick}>
            Explore Recipes
        </button>
      </div>
    </section>
  );
}
