// components/Recommendations.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Recommendations({ category, area, currentId }) {
  const [recipes, setRecipes] = useState([]);

    useEffect(() => {
    const fetchRecommendations = async () => {
        try {
        const [catRes, areaRes] = await Promise.all([
            fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`),
            fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`)
        ]);

        const [catData, areaData] = await Promise.all([catRes.json(), areaRes.json()]);

        const combined = [...(catData.meals || []), ...(areaData.meals || [])];

        const unique = Array.from(new Map(
            combined.map(item => [item.idMeal, item])
        ).values());

        const filtered = unique.filter(meal => meal.idMeal !== currentId);

        // Fetch detailed information for each meal
        const detailedMeals = await Promise.all(
            filtered.slice(0, 6).map(async (meal) => {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
            const data = await res.json();
            return data.meals ? data.meals[0] : null;
            })
        );

        // Filter out any null values
        setRecipes(detailedMeals.filter(Boolean));
        } catch (error) {
        console.error('Error fetching recommendations:', error);
        }
    };

    if (category && area) {
        fetchRecommendations();
    }
    }, [category, area, currentId]);

  if (recipes.length === 0) return null;

  return (
    <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🍽️ You Might Also Like</h2>
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recipes.map(recipe => (
            <div
                key={recipe.idMeal}
                className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform hover:scale-[1.02]"
            >
                <Image
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
                className="w-full h-48 object-cover"
                    width={400}
                    height={250}
                />
                <div className="p-4">
                {/* Recipe Title */}
                <h3 className="text-lg font-bold text-gray-800">{recipe.strMeal}</h3>

                {/* Recipe Area */}
                <p className="text-sm text-gray-500 mb-2">{recipe.strArea}</p>

                {/* Recipe Instructions */}
                {recipe.strInstructions && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {recipe.strInstructions}
                    </p>
                )}

                {/* Button to view recipe */}
                <Link
                    href={`/recipes/${recipe.idMeal}`}
                    className="inline-block bg-[#D00000] text-white text-sm px-4 py-2 rounded hover:bg-red-700 transition"
                >
                    Whip It Up! →
                </Link>
                </div>
            </div>
            ))}
        </section>
    </div>
  );
}
