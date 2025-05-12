import Image from 'next/image';
import * as React from 'react';

import RecipeActions from '@/app/components/RecipeActions';
import SiteLayout from '@/app/components/SiteLayout';
import RecipeReviews from '@/app/components/RecipeReviews';

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
        <div className='print-container'>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <Image
              src={meal.strMealThumb}
              alt={meal.strMeal}
              width={600}
              height={600}
              className="rounded-2xl shadow-2xl w-full h-auto object-cover transition-all duration-300 hover:scale-105"
            />
            <div>
              <h1 className="text-4xl font-bold text-[#D00000] mb-2">{meal.strMeal}</h1>
              <p className="text-gray-600 mb-4 text-sm">
                <strong className="font-medium">Category:</strong> {meal.strCategory} | <strong>Origin:</strong> {meal.strArea}
              </p>

              {meal.strTags && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {meal.strTags.split(',').map((tag, i) => (
                    <span key={i} className="bg-[#F8F9FA] text-sm text-[#D00000] px-4 py-2 rounded-full border border-[#D00000] shadow-md">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="text-2xl font-semibold mb-2 mt-4 text-[#D00000]">🧂 Ingredients</h2>
              <ul className="grid gr
              id-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-sm text-gray-800">
                {ingredients.map((item, idx) => (
                  <li key={idx} className="flex flex-col items-center gap-2 mb-6">
                    {/* Ingredient Image */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 shadow-md">
                      <Image
                        src={`https://www.themealdb.com/images/ingredients/${item.ingredient.toLowerCase()}.png`}
                        alt={item.ingredient}
                        width={100}
                        height={100}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Ingredient Name and Measure */}
                    <span className="text-center font-medium">{item.ingredient}</span>
                    {item.measure && <span className="text-gray-600 text-xs">{item.measure}</span>}
                  </li>
                ))}
              </ul>

            </div>
          </div>

          {/* Instructions Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 text-[#D00000]">📋 Instructions</h2>
            <p className="leading-7 whitespace-pre-line text-gray-700">{meal.strInstructions}</p>
          </div>

          {/* YouTube Video Section */}
          <div className="no-print">
            {meal.strYoutube && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-4 text-[#D00000]">🎥 Watch How It’s Made</h2>
                <div className="relative pb-[56.25%]">
                  <iframe
                    src={`https://www.youtube.com/embed/${meal.strYoutube.split("v=")[1]}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-2xl"
                  ></iframe>
                </div>
                <p className="mt-2 text-gray-700">
                  <a
                    href={meal.strYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D00000] underline hover:opacity-80"
                  >
                    Watch on YouTube
                  </a>
                </p>
              </div>
            )}
          </div>


          <div className="no-print">
            <RecipeActions meal={meal} />
          </div>

          {/* Extra fields display */}
          {extraFields.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4 text-[#D00000]">📎 Additional Info</h2>
              <ul className="grid sm:grid-cols-2 gap-4 text-sm">
                {extraFields
                  .filter(([key]) => key !== 'idMeal')
                  .map(([key, val]) => (
                    <li key={key}>
                      <strong className="capitalize text-[#D00000]">
                        {key.replace('str', '').replace(/([A-Z])/g, ' $1')}
                      </strong>
                      : {val}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* // Inside the return statement */}
        <RecipeReviews mealId={id} />
      </section>
    </SiteLayout>
  );
}
