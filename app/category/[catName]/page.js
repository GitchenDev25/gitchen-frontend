"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SiteLayout from "@/app/components/SiteLayout";

export default function CategoryPage() {
  const { catName } = useParams();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryMeals = async () => {
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${catName}`
        );
        const data = await res.json();
        setMeals(data.meals || []);
      } catch (err) {
        console.error("Failed to fetch category meals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryMeals();
  }, [catName]);

  return (
    <SiteLayout>
      <section className="px-6 py-12 bg-[#F8F9FA]">
        <h2 className="text-3xl font-semibold text-center mb-8 capitalize">
          Recipes in {catName} Category
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
                <Image
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  width={500}
                  height={300}
                  className="object-cover"
                  priority
                />
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{meal.strMeal}</h3>
                  <Link href={`../../recipes/${meal.idMeal}`} className="mt-4">
                    <button className="w-full bg-[#D00000] text-white px-4 py-2 rounded-md hover:opacity-90 transition">
                      View Recipe
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
