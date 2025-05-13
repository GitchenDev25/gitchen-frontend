'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { toast } from 'react-toastify';


export default function RecipeActions({ meal }) {
  const { user } = useUser();
  const userId = user?.id;
  const [isFavorited, setIsFavorited] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!userId || !meal?.idMeal) return;

      try {
        const res = await fetch(`${apiUrl}/api/favorites/check?userId=${userId}&mealId=${meal.idMeal}`);
        const data = await res.json();

        setIsFavorited(data.favorited);
      } catch (err) {
        console.error('Error checking favorite:', err);
      }
    };

    checkFavoriteStatus();
  }, [userId, meal?.idMeal]);
  
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      // Add short delay so layout stabilizes before print
      setTimeout(() => {
        window.print();
      }, 200);
    }
  };      

  

  const addToFavorites = async (userId, mealId, mealName) => {
    const toastId = toast.loading('Adding to favorites...');
    try {
      const response = await axios.post(`${apiUrl}/api/favorites/add`, {
        userId,
        mealId,
        mealName,
        type: 'favorite',
      });
  
      if (response.data.success) {
        setIsFavorited(true);
        toast.update(toastId, {
          render: '🎉 Added to favorites!',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: '❌ Error adding to favorites',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      });
    }
  };
  
  
  const removeFromFavorites = async () => {
    const toastId = toast.loading('Removing from favorites...');
    try {
      const res = await fetch(`${apiUrl}/api/favorites/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, mealId: meal.idMeal }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setIsFavorited(false);
        toast.update(toastId, {
          render: '💔 Removed from favorites',
          type: 'info',
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: data.message || 'Failed to remove',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: '❌ Error removing from favorites',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      });
    }
  };
  
  

    const handleWishlist = async () => {
      try {
        const res = await fetch('../api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,          // Replace with Clerk's user ID
            recipeId: meal.idMeal,
            recipeData: {
              name: meal.strMeal,
              thumbnail: meal.strMealThumb,
              category: meal.strCategory,
              area: meal.strArea,
            },
          }),
        });
    
        const data = await res.json();
        if (res.ok) {
          alert('Added to Wishlist!');
        } else {
          alert(data.message || 'Failed to add to wishlist.');
        }
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        alert('Something went wrong.');
      }
    };
      

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4 text-[#D00000]">❤️ Save or Share</h2>

      <SignedIn>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() =>
              isFavorited
                ? removeFromFavorites()
                : addToFavorites(userId, meal.idMeal, meal.strMeal)
            }
            className={`px-4 py-2 rounded shadow transition text-white ${
              isFavorited ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#D00000] hover:opacity-90'
            }`}
          >
            {isFavorited ? '💔 Lost the Taste?' : '🤍 Whip This Into Favorites'}
          </button>


          <button
            onClick={handleWishlist}
            className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:opacity-90 transition"
            style={{cursor: "pointer"}}
          >
            📌 Add to Wishlist
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-700 text-white px-4 py-2 rounded shadow hover:opacity-90 transition"
            style={{cursor: "pointer"}}
          >
            📄 Export as PDF
          </button>
        </div>
      </SignedIn>

      <SignedOut>
        <p className="text-gray-600 mt-2">
          <SignInButton>
            <span className="text-[#D00000] underline cursor-pointer">Sign in</span>
          </SignInButton>{' '}
          to save, share or export this recipe.
        </p>
      </SignedOut>
    </div>
  );
}
