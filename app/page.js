"use client"
// app/page.js
import { useEffect, useState } from  'react';
import Link from "next/link";
import Image from 'next/image';

import SiteLayout from './components/SiteLayout';
import RandomRecipesSection from './components/RandomRecipesSection';
import CategoryPreview from './components/CategoryPreviewSection';
import DawnOfDeliciousnessSection from './components/DawnOfDeliciousnessSection';
import SweetToothZoneSection from './components/SweetToothZoneSection';
import CTASection from './components/CTASection';

export default function HomePage() {
  const bgSmall = '/images/SmallChefImage.jpg';
  const bgMedium = '/images/MediumChefImage.jpg';
  const bgLarge = '/images/LargeChefImage.jpg';

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const countries = [
    {
      title: "Italian Pasta Nights",
      emoji: "🍝",
      country: "Italian",
      image: "/images/Italian.jpg",
    },
    {
      title: "Japanese Zen on a Plate",
      emoji: "🍣",
      country: "Japanese",
      image: "/images/Japanese.jpg",
    },
    {
      title: "Mexican Fiesta Flavors",
      emoji: "🌮",
      country: "Mexican",
      image: "/images/Mexican.jpg",
    },
    {
      title: "Indian Spice Symphony",
      emoji: "🍛",
      country: "Indian",
      image: "/images/Indian.jpg",
    },
  ];

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
    <SiteLayout>
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[100dvh] flex items-center justify-center text-center text-black">
          {/* Background Images for sm, md, lg */}
          {/* Small Screen */}
          <div className="absolute inset-0 bg-cover bg-center block md:hidden" style={{ backgroundImage: `url('${bgSmall}')` }}></div>

          {/* Medium Screen */}
          <div className="absolute inset-0 bg-cover bg-center hidden md:block lg:hidden" style={{ backgroundImage: `url('${bgMedium}')` }}></div>

          {/* Large Screen */}
          <div className="absolute inset-0 bg-cover bg-center hidden lg:block" style={{ backgroundImage: `url('${bgLarge}')` }}></div>

          {/* White overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "#E5E5E5", opacity: 0.9 }}
          />

          {/* Content */}
          <div className="relative z-10 px-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Next Favorite Meal Is Just a Click Away 🍲
            </h1>
            <p className="text-lg md:text-xl mb-6">
              Thousands of delicious recipes from around the world. All in one place.
            </p>
            <Link href="/recipes">
              <button className="bg-[#D00000] text-white px-6 py-3 rounded-md text-lg hover:opacity-90 transition" style={{ cursor: 'pointer' }}>
                Browse Recipes
              </button>
            </Link>
          </div>
        </section>

        {/* Random Recipe Preview */}
        <RandomRecipesSection />

        {/* Food Categories Preview */}
        <CategoryPreview />

      {/* {Breakfast Foods} */}
        <DawnOfDeliciousnessSection />

        {/* Why Gitchen? */}
        <section className="py-16 px-6 bg-white text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">Why Gitchen?</h2>
          <ul className="grid gap-6 max-w-2xl mx-auto text-lg text-gray-700">
            <li className="flex items-center justify-center gap-3">
              <span className="text-2xl">🌍</span> Explore recipes from over <strong>20+ countries</strong>
            </li>
            <li className="flex items-center justify-center gap-3">
              <span className="text-2xl">🔖</span> Save your favorites and access <strong>anytime</strong>
            </li>
            <li className="flex items-center justify-center gap-3">
              <span className="text-2xl">👨‍🍳</span> Step-by-step guides for <strong>all skill levels</strong>
            </li>
            <li className="flex items-center justify-center gap-3">
              <span className="text-2xl">💬</span> Community <strong>tips and suggestions</strong>
            </li>
          </ul>
        </section>



        {/* Desserts */}
        <SweetToothZoneSection />


        {/* How It Works */}
        <section style={{ padding: "4rem 2rem", backgroundColor: "#E5E5E5", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "2rem" }}>How It Works</h2>
          <div style={{
            display: "grid",
            gap: "1.5rem",
            maxWidth: "700px",
            margin: "0 auto",
            gridTemplateColumns: "1fr",
          }}>
            {[
              { step: "1", text: "Search or browse meals by country, category, or craving", emoji: "🔍" },
              { step: "2", text: "View detailed instructions and ingredients", emoji: "📋" },
              { step: "3", text: "Save it, cook it, and enjoy!", emoji: "🍽️" },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  fontSize: "1.1rem",
                }}
              >
                <span style={{ fontSize: "1.8rem" }}>{item.emoji}</span>
                <p style={{ margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Countries */}
        <section className="px-6 py-12 bg-white">
          <h2 className="text-3xl font-semibold text-center mb-8">A Taste of the World</h2>
          <div className="flex gap-6 flex-wrap justify-center">
            {countries.map((item, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[220px] max-w-[280px] text-center p-4 bg-[#E5E5E5] rounded-xl shadow-md hover:shadow-lg transition"
              >
                <div className="relative w-full h-40 rounded-md overflow-hidden mb-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    // objectFit="cover"
                    className="rounded-md"
                    priority
                  />
                </div>
                <p className="text-xl mb-1">{item.emoji}</p>
                <p className="text-lg font-semibold">{item.title}</p>
                <Link
                  href={`./countries/${item.country}`}
                  style={{ cursor: 'pointer' }}
                  className="mt-4 inline-block px-5 py-2 bg-[#D00000] text-white rounded-md hover:opacity-90 transition"
                >
                  Explore
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <CTASection />

      </main>
    </SiteLayout>
  );
}
