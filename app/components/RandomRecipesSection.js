import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Import the Image component

export default function RandomRecipesSection() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomMeals = async () => {
      const promises = Array.from({ length: 10 }).map(() =>
        fetch("https://www.themealdb.com/api/json/v1/1/random.php").then((res) =>
          res.json()
        )
      );

      const results = await Promise.all(promises);
      const allMeals = results.map((res) => res.meals[0]);
      setMeals(allMeals);
      setLoading(false);
    };

    fetchRandomMeals();
  }, []);

  return (
    <section className="px-6 py-12 bg-[#F8F9FA]">
      <h2 className="text-3xl font-semibold text-center mb-8">
        What You’re Craving Right Now
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-[#D00000] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {meals.map((meal) => (
            <div
              key={meal.idMeal}
              className="bg-white rounded-xl overflow-hidden flex flex-col"
              style={{ boxShadow: "2px 2px 3px 2px rgba(0, 0, 0, 0.15)" }}
            >
              {/* Use next/image for the meal image */}
              <Image
                src={meal.strMealThumb}
                alt={meal.strMeal}
                width={500} // Set a fixed width for the image
                height={300} // Set a fixed height for the image
                className="object-cover"
                priority // Optional: to load the image immediately on initial render
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-2">{meal.strMeal}</h3>
                <p className="text-sm text-gray-600 flex-grow">
                  {meal.strInstructions.slice(0, 100)}...
                </p>
                <Link href={`../recipes/${meal.idMeal}`} className="mt-4" style={{ cursor: 'pointer' }}>
                  <button className="w-full bg-[#D00000] text-white px-4 py-2 rounded-md hover:opacity-90 transition" style={{ cursor: 'pointer' }}>
                    Whip It Up
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
