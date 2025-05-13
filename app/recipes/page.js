'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SiteLayout from '../components/SiteLayout';
import SkeletonCard from "../components/SkeletonCard";
import FilterPopup from '../components/FilterPopUp';
import {
  SignedIn,
  SignedOut,
  SignInButton
} from '@clerk/nextjs';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const API = 'https://www.themealdb.com/api/json/v1/1';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [isFilterPopupVisible, setIsFilterPopupVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);


  useEffect(() => {
      // Fetch ingredients on mount
    fetch(`${API}/list.php?i=list`)
    .then(res => res.json())
    .then(data => setIngredients(data.meals || []));

    // Fetch searched/typed data
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedIngredients.length > 0) {
      handleSearch('multi-ingredient', selectedIngredients);
    } else {
      // Optionally: clear recipes or revert to default
      setRecipes([]);
    }
  }, [selectedIngredients]);


  const fetchInitialData = async () => {
    setLoading(true);

    try {
      // Step 1: Fetch 31 random meals
      const promises = Array.from({ length: 31 }, () =>
        fetch(`${API}/random.php`).then(res => res.json())
      );

      const [results, categoryRes, areaRes] = await Promise.all([
        Promise.all(promises),
        fetch(`${API}/list.php?c=list`).then(res => res.json()),
        fetch(`${API}/list.php?a=list`).then(res => res.json()),
      ]);

      // Step 2: Deduplicate meals by ID
      const uniqueMealsMap = new Map();
      results.forEach(res => {
        const meal = res.meals?.[0];
        if (meal && !uniqueMealsMap.has(meal.idMeal)) {
          uniqueMealsMap.set(meal.idMeal, meal);
        }
      });

      const uniqueMeals = Array.from(uniqueMealsMap.values());
      const mealIds = uniqueMeals.map(m => m.idMeal);

      // Step 3: Fetch all reviews
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const reviewsRes = await fetch(`${API_BASE}/api/reviews`);
      const reviews = await reviewsRes.json();

      // Step 4: Group reviews by mealId
      const reviewMap = reviews.reduce((acc, r) => {
        if (!acc[r.mealId]) acc[r.mealId] = [];
        acc[r.mealId].push(r);
        return acc;
      }, {});

      // Step 5: Add rating + reviewCount to each meal
      const enrichedMeals = uniqueMeals.map(meal => {
        const mealReviews = reviewMap[meal.idMeal] || [];
        const reviewCount = mealReviews.length;
        const avgRating =
          reviewCount > 0
            ? mealReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;

        return {
          ...meal,
          rating: avgRating.toFixed(1), // e.g. "4.2"
          reviewCount,
        };
      });

      // Step 6: Set enriched state
      setRecipes(enrichedMeals);
      setCategories(categoryRes.meals || []);
      setAreas(areaRes.meals || []);
    } catch (err) {
      console.error('Error in fetchInitialData:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (type, value) => {
    setLoading(true);
    try {
      let fullMeals = [];

      if (type === 'multi-ingredient') {
        // 1. Fetch meals for each selected ingredient
        const results = await Promise.all(
          value.map(ing =>
            fetch(`${API}/filter.php?i=${encodeURIComponent(ing)}`)
              .then(res => res.json())
          )
        );

        // 2. Build arrays of meal IDs and compute their intersection
        const idLists = results.map(r => (r.meals || []).map(m => m.idMeal));
        const commonIds = idLists.length
          ? idLists.reduce((a, b) => a.filter(id => b.includes(id)))
          : [];

        // 3. Lookup full details for each common ID
        const details = await Promise.all(
          commonIds.map(id =>
            fetch(`${API}/lookup.php?i=${id}`)
              .then(res => res.json())
          )
        );
        fullMeals = details.flatMap(d => d.meals || []);
      } else {
        // existing single-type logic (letter, category, ingredient, area, name)…
        let url;
        switch (type) {
          case 'letter':
            url = `${API}/search.php?f=${value}`;
            break;
          case 'category':
            url = `${API}/filter.php?c=${value}`;
            break;
          case 'ingredient':
            url = `${API}/filter.php?i=${value}`;
            break;
          case 'area':
            url = `${API}/filter.php?a=${value}`;
            break;
          case 'name':
          default:
            url = `${API}/search.php?s=${value}`;
        }
        const res = await fetch(url);
        const data = await res.json();

        if (['category', 'ingredient', 'area'].includes(type)) {
          const meals = data.meals || [];
          const fullMealPromises = meals.map(meal =>
            fetch(`${API}/lookup.php?i=${meal.idMeal}`).then(r => r.json())
          );
          const fullMealsData = await Promise.all(fullMealPromises);
          fullMeals = fullMealsData.map(m => m.meals?.[0]).filter(Boolean);
        } else {
          fullMeals = data.meals || [];
        }
      }

      // Fetch and merge review data (unchanged)
      const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`);
      const reviews = await reviewsRes.json();
      const reviewMap = reviews.reduce((acc, r) => {
        acc[r.mealId] = acc[r.mealId] || [];
        acc[r.mealId].push(r);
        return acc;
      }, {});

      const enrichedMeals = fullMeals.map(meal => {
        const mealReviews = reviewMap[meal.idMeal] || [];
        const count = mealReviews.length;
        const avg = count
          ? mealReviews.reduce((sum, r) => sum + r.rating, 0) / count
          : 0;
        return { 
          ...meal,
          rating: avg.toFixed(1),
          reviewCount: count
        };
      });

      setRecipes(enrichedMeals);
    } catch (err) {
      console.error('Search error:', err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyPress = e => {
    if (e.key === 'Enter') handleSearch();
  };

  const openFilterPopup = () => {
    setIsFilterPopupVisible(true);
  };

  const closeFilterPopup = () => {
    setIsFilterPopupVisible(false);
  };

  const toggleIngredient = (ing) => {
    setSelectedIngredients(prev => 
      prev.includes(ing) 
        ? prev.filter(i => i !== ing) 
        : [...prev, ing]
    );
  };


  return (
    <SiteLayout>
        <main className="px-4 py-8 max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">
              🍳 Explore Delicious Recipes
          </h1>

          {/* Search + Dropdown */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6 max-w-4xl mx-auto">
              <div className="grid gap-4 md:grid-cols-3">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Search for recipes..."
                    className="border border-gray-300 px-4 py-2 rounded-md w-full focus:ring-2 focus:ring-red-400"
                />
                <button
                    onClick={() => handleSearch('name', query)}
                    className="bg-[#D00000] text-white font-semibold px-6 py-2 rounded-md w-full hover:bg-red-700 transition-colors duration-200"
                >
                    🔍 Search
                </button>
                <select
                    value={searchType}
                    onChange={e => setSearchType(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-md w-full focus:ring-2 focus:ring-red-400"
                >
                    <option value="name">Recipe Name</option>
                    <option value="letter">First Letter</option>
                    <option value="category">Category</option>
                    <option value="ingredient">Ingredient</option>
                    <option value="area">Country</option>
                </select>

                {/* Filter Options */}
                <SignedIn>
                  <div>
                    <button
                      onClick={openFilterPopup}
                      className="bg-[#D00000] text-white font-bold px-4 py-2 rounded-md shadow-md hover:bg-red-700 transition-all"
                    >
                      Open Filters
                    </button>

                    {isFilterPopupVisible && (
                      <FilterPopup onClose={closeFilterPopup}>
                        <div className="mb-8">
                          <h2 className="font-bold text-xl text-gray-800 mb-3">🔤 Filter by Letter</h2>
                          <div className="flex flex-wrap gap-2">
                            {LETTERS.map(letter => (
                              <button
                                key={letter}
                                onClick={() => handleSearch('letter', letter.toLowerCase())}
                                className="bg-white border border-gray-300 text-sm font-medium px-3 py-1 rounded-md shadow-sm hover:bg-[#D00000] hover:text-white transition-all"
                              >
                                {letter}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Filter by Category */}
                        <div className="mb-8">
                          <h2 className="font-bold text-xl text-gray-800 mb-3">🍽️ Filter by Category</h2>
                          <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                              <button
                                key={cat.strCategory}
                                onClick={() => handleSearch('category', cat.strCategory)}
                                className="bg-white border border-gray-300 text-sm font-medium px-4 py-1 rounded-full hover:bg-[#D00000] hover:text-white transition-all shadow-sm"
                              >
                                {cat.strCategory}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Filter by Area */}
                        <div className="mb-10">
                          <h2 className="font-bold text-xl text-gray-800 mb-3">🌍 Filter by Area</h2>
                          <div className="flex flex-wrap gap-2">
                            {areas.map(area => (
                              <button
                                key={area.strArea}
                                onClick={() => handleSearch('area', area.strArea)}
                                className="bg-white border border-gray-300 text-sm font-medium px-4 py-1 rounded-full hover:bg-[#D00000] hover:text-white transition-all shadow-sm"
                              >
                                {area.strArea}
                              </button>
                            ))}
                          </div>
                        </div>

                      <div className="mb-10">
                        <div className="flex flex-col gap-4">
                          {/* Header Section */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h2 className="font-bold text-xl text-gray-800 whitespace-nowrap">
                                🧂 Select One or More Ingredients
                              </h2>
                              <p className="text-sm text-gray-600 whitespace-nowrap">
                                Click ingredients below to add or remove. Recipes update automatically.
                              </p>
                            </div>
                            <div className="flex items-center gap-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-[#D00000]">
                                Selected: {selectedIngredients.length}
                              </span>
                              <button
                                onClick={() => setShowIngredients(!showIngredients)}
                                className="text-sm text-[#D00000] font-medium hover:underline flex items-center gap-1"
                              >
                                {showIngredients ? 'Hide' : 'Show All'}
                                <span
                                  className={`transform transition-transform ${
                                    showIngredients ? 'rotate-180' : ''
                                  }`}
                                >
                                  ▼
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Ingredient Buttons */}
                          <div
                            className={`transition-all duration-500 overflow-hidden ${
                              showIngredients ? 'max-h-96' : 'max-h-0' // Increased max-h for more visibility
                            }`}
                          >
                            <div className="overflow-y-auto max-h-96 border rounded-lg p-4 bg-white shadow-md custom-scrollbar">
                              <div className="flex flex-wrap gap-2">
                                {ingredients.map(ing => (
                                  <button
                                    key={ing.strIngredient}
                                    onClick={() => toggleIngredient(ing.strIngredient)}
                                    className={`
                                      px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition-all duration-200
                                      ${
                                        selectedIngredients.includes(ing.strIngredient)
                                          ? 'bg-[#D00000] text-white'
                                          : 'bg-gray-100 hover:bg-[#D00000] hover:text-white'
                                      }
                                    `}
                                  >
                                    {ing.strIngredient}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      </FilterPopup>
                    )}
                  </div>
                </SignedIn>
                
                <SignedOut>
                  {/* Show this if not signed in */}
                  <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
                    Please <SignInButton className="text-sm text-[#D00000] underline" /> to access filters.
                  </div>
                </SignedOut>
            </div>
          </div>

          {/* Recipe Grid */}
          {loading ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </section>
          ) : recipes.length > 0 ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <div
                  key={recipe.idMeal}
                  className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform hover:scale-[1.02]"
                >
                  <Image
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    {/* Recipe Title */}
                    <h3 className="text-lg font-bold text-gray-800">{recipe.strMeal}</h3>

                    {/* Ratings and Reviews */}
                    <div className="flex items-center text-sm text-yellow-500 mb-2">
                      {recipe.reviewCount > 0 ? (
                        <>
                          {/* Display Stars */}
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <svg
                              key={idx}
                              xmlns="http://www.w3.org/2000/svg"
                              fill={idx < recipe.rating ? 'currentColor' : 'none'}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 17.75l-6.29 3.3 1.6-7.03-5.51-4.77 7.18-.61L12 2l2.02 6.7 7.17.61-5.52 4.77 1.6 7.03L12 17.75z"
                              />
                            </svg>
                          ))}
                          {/* Display Rating Value */}
                          <span className="ml-1 text-gray-600">{recipe.rating}</span>
                          {/* Display Review Count */}
                          <span className="ml-1 text-gray-500">({recipe.reviewCount})</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No reviews yet</span>
                      )}
                    </div>

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
                      style={{ cursor: 'pointer' }}
                      className="bg-[#D00000] text-white text-sm px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Whip It Up! →
                    </Link>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <p className="text-center text-gray-500">No recipes found.</p>
          )}
        </main>
    </SiteLayout>
  );
}
