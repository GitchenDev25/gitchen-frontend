'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import SiteLayout from '@/app/components/SiteLayout';
import FavoritesTab from '@/app/components/FavoritesTab';
import ReviewsTab from '@/app/components/ReviewsTab';

const tabs = ["Favorites", "Reviews", "Shopping List", "Profile"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Favorites");
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/'); // Redirect to Clerk's sign-in page
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  

  return (
    <SiteLayout>
      <section className="min-h-screen bg-[#f8f9fa] px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName || 'Chef'}!</h1>
          <p className="text-gray-600">Explore your saved recipes and more.</p>
        </div>

        {/* Tab Headers */}
        <div className="flex justify-center gap-4 flex-wrap mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === tab
                  ? 'bg-[#D00000] text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {activeTab === "Favorites" && <FavoritesTab userId={user.id} />}
          {activeTab === "Reviews" && <ReviewsTab />}
          {activeTab === "Shopping List" && <ShoppingListTab />}
          {activeTab === "Profile" && <ProfileTab user={user} />}
        </div>
      </section>
    </SiteLayout>
  );
}



function ShoppingListTab() {
  return <p>Your shopping list will appear here.</p>;
}

function ProfileTab({ user }) {
  return (
    <div>
      <p><strong>Name:</strong> {user.fullName}</p>
      <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
      <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
