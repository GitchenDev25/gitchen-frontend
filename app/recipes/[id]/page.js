import Image from 'next/image';
import * as React from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton
} from '@clerk/nextjs';


import RecipeActions from '@/app/components/RecipeActions';
import SiteLayout from '@/app/components/SiteLayout';
import RecipeReviews from '@/app/components/RecipeReviews';
import Recommendations from '@/app/components/Recomendations';
import ReadAloudButton from '@/app/components/ReadAloudButton';
import SocialShare from '@/app/components/SocialShare';

export async function generateMetadata({ params }) {
  return {
    title: `Recipe | Gitchen`,
  };
}

export default async function RecipePage({params}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  const meal = data.meals?.[0];

  if (!meal) {
    return <div className="p-6 text-center text-xl">Meal not found.</div>;
  }

  // Extract ingredients
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing?.trim()) {
      ingredients.push({ ingredient: ing.trim(), measure: meas?.trim() || '' });
    }
  }

  // Extract all non-empty fields to display as metadata
  const extraFields = Object.entries(meal).filter(([key, val]) => {
    return val && typeof val === 'string' && val.trim() !== '' &&
           !key.startsWith('strIngredient') &&
           !key.startsWith('strMeasure') &&
           !['strMeal', 'strMealThumb', 'strInstructions', 'strYoutube', 'strTags', 'strCategory', 'strArea'].includes(key);
  });

  return (
    <SiteLayout>
      <section className="px-4 md:px-8 lg:px-16 py-10 max-w-7xl mx-auto text-gray-800">
        {/* Recipe Main Header */}
        <div className="print-container px-4 md:px-12 lg:px-20 py-10 max-w-screen-xl mx-auto space-y-16">

          {/* Header Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Meal Image */}
            <Image
              src={meal.strMealThumb}
              alt={meal.strMeal}
              width={600}
              height={600}
              className="rounded-3xl shadow-xl w-full h-auto object-cover"
            />

            {/* Meal Info */}
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-[#D00000]">{meal.strMeal}</h1>

              <p className="text-gray-500 text-sm">
                <strong className="font-semibold">Category:</strong> {meal.strCategory} &nbsp;|&nbsp;
                <strong className="font-semibold">Origin:</strong> {meal.strArea} &nbsp;|&nbsp;                
                <span className="text-sm text-gray-600 font-medium italic" style={{margin: "0 5px"}}>
                  <span className="text font-semibold not-italic">Ingredients:</span> {ingredients.length}
                </span>
              </p>

              {/* Tags */}
              {meal.strTags && (
                <div className="flex flex-wrap gap-2">
                  {meal.strTags.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="bg-[#F8F9FA] text-sm text-[#D00000] px-4 py-1 rounded-full border border-[#D00000]"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-semibold text-[#D00000]">🧂 Ingredients</h2>
              </div>

              {/* Ingredient grid here */}
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {ingredients.map((item, idx) => (
                <li key={idx} className="flex flex-col items-center text-center space-y-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 shadow-sm">
                    <Image
                      src={`https://www.themealdb.com/images/ingredients/${item.ingredient.toLowerCase()}.png`}
                      alt={item.ingredient}
                      width={100}
                      height={100}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-medium text-gray-800">{item.ingredient}</span>
                  {item.measure && <span className="text-xs text-gray-500">{item.measure}</span>}
                </li>
              ))}
            </ul>
          </section>

          {/* Instructions */}
          <section>
              <h2 className="text-3xl font-semibold text-[#D00000]" style={{margin: "15px 0"}}>📋 Instructions</h2>
            <div className="flex items-center justify-between mb-4">
              <ReadAloudButton text={meal.strInstructions} />
            </div>
            {/* 
            <div className="bg-[#F8F9FA] p-6 rounded-xl shadow-sm leading-7 text-gray-700 whitespace-pre-line">
              {meal.strInstructions}
            </div> */}
          </section>

          {/* YouTube */}
          {meal.strYoutube && (
            <section className="no-print">
              <h2 className="text-3xl font-semibold text-[#D00000] mb-4">🎥 Watch How It’s Made</h2>
              <div className="relative pb-[56.25%] rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${meal.strYoutube.split("v=")[1]}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
              <p className="mt-2 text-gray-600">
                <a
                  href={meal.strYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D00000] underline hover:opacity-80"
                >
                  Watch on YouTube
                </a>
              </p>
            </section>
          )}

                    {/* Extra Fields */}
          {extraFields.length > 0 && (
            <section>
              <h2 className="text-3xl font-semibold text-[#D00000] mb-4">📎 Additional Info</h2>
              <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                {extraFields
                  .filter(([key]) => key !== 'idMeal')
                  .map(([key, val]) => (
                    <li key={key} className="bg-[#F8F9FA] p-4 rounded-xl shadow-sm">
                      <strong className="capitalize text-[#D00000] block mb-1">
                        {key.replace('str', '').replace(/([A-Z])/g, ' $1')}
                      </strong>
                      <span>{val}</span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {/* Recipe Actions */}
          <div className="no-print">
            <RecipeActions meal={meal} />
            <SignedIn>
              <SocialShare />
            </SignedIn>
          </div>
        </div>

        {/* // Inside the return statement */}
        <RecipeReviews mealId={id} />
        <br />
        <br />
         <div className="no-print">
            <SignedIn>
              <Recommendations
                category={meal.strCategory}
                area={meal.strArea}
                tags={meal.strTags ? meal.strTags.split(',') : []}
                currentId={id}
              />
            </SignedIn>
            <SignedOut>
              {/* Show this if not signed in */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <svg
                    className="h-6 w-6 text-yellow-400 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    />
                  </svg>
                  <p className="text-yellow-800 text-sm leading-tight">
                    You need to be signed in to see recommendations.
                  </p>
                </div>
                <SignInButton>
                  <button className="w-full sm:w-auto bg-[#D00000] hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-md transition-all">
                    Sign In to Continue
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
         </div>
      </section>
    </SiteLayout>
  );
}
