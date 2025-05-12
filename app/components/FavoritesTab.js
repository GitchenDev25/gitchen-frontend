'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap'; // Import GSAP
import { toast, ToastContainer } from 'react-toastify'; // Import Toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Import Toast CSS

export default function FavoritesTab({ userId }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch Favorites
  const fetchFavorites = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/favorites/${userId}`);
      const favorites = res.data;

      const meals = await Promise.all(
        favorites.map(async (fav) => {
          const mealRes = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${fav.mealId}`);
          const meal = mealRes.data.meals?.[0];
          return {
            ...fav,
            title: meal?.strMeal,
            image: meal?.strMealThumb,
          };
        })
      );

      setRecipes(meals.filter((m) => m.title && m.image));
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      toast.error('Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchFavorites();
  }, [userId]);

  // Remove a favorite with animation
  const handleRemove = async (mealId) => {
    const removed = recipes.find((r) => r.mealId === mealId);
    const recipeIndex = recipes.findIndex((r) => r.mealId === mealId);

    // Animate removal
    gsap.to(`#recipe-${mealId}`, { opacity: 0, scale: 0.5, duration: 0.3, onComplete: () => {
      // Remove from the list after the animation completes
      setRecipes((prev) => prev.filter((r) => r.mealId !== mealId));

      // Show toast notification after removal
      toast.success(`${removed.title} has been removed from favorites.`);
    } });

    // Backend API Call after animation
    try {
      await axios.delete(`${backendUrl}/api/favorites/${userId}/${mealId}`);
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      toast.error('Backend error: could not remove favorite');
    }
  };

  // Clear all favorites with animation
  const handleClearAll = async () => {
    // Animate the whole grid disappearing
    gsap.to('.favorite-card', {
      opacity: 0,
      scale: 0.5,
      duration: 0.3,
      onComplete: async () => {
        try {
          await axios.delete(`${backendUrl}/api/favorites/clear/${userId}`);
          setRecipes([]); // Clear the state

          // Show success toast after clearing
          toast.success('All favorites have been cleared.');
        } catch (err) {
          console.error('Failed to clear favorites:', err);
          toast.error('Failed to clear favorites.');
        }
      },
    });
  };

  if (loading) return <p className="text-gray-500">Loading favorites...</p>;
  if (recipes.length === 0) return <p>You have no saved recipes yet.</p>;

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Clear All Button */}
      <div className="mb-4 text-right">
        <button
          onClick={handleClearAll}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Clear All Favorites
        </button>
      </div>

      {/* Favorites Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.mealId}
            id={`recipe-${recipe.mealId}`} // ID for GSAP targeting
            className="favorite-card border rounded bg-white shadow hover:shadow-md transition overflow-hidden"
          >
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/recipes/${recipe.mealId}`)}
            >
              <Image
                src={recipe.image}
                alt={recipe.title}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{recipe.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Saved on {new Date(recipe.addedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="p-4 border-t text-right">
              <button
                onClick={() => handleRemove(recipe.mealId)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
