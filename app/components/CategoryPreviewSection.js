import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import the Image component

export default function CategoryPreview() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Various Categories</h2>
        <p className="text-gray-500">Loading categories...</p>
      </section>
    );
  }

  return (
    <section className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Various Categories</h2>
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((cat) => (
          <div
            key={cat.idCategory}
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer text-center p-4"
            onClick={() => router.push(`/category/${cat.strCategory}`)}
          >
            <Image
              src={cat.strCategoryThumb}
              alt={cat.strCategory}
              width={500} // Set a fixed width for the image
                height={300} // Set a fixed height for the image
                priority // Optional: to load the image immediately on initial render
              className="w-full h-32 object-cover rounded-md mb-3"
            />
            <p className="font-medium">{cat.strCategory}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
