// src/components/ProductCard.js
import Image from "next/image";

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function ProductCard({ product }) {
    console.log("IMG URL:", product.img_url);

    return (
        <div className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">

            {/* Gambar tanpa <Image /> supaya tidak diblock Next.js */}
            <div className="w-full overflow-hidden rounded-t-lg">
                <img
                    src={product.img_url}
                    alt={product.name}
                    className="w-full h-60 object-cover"
                />
            </div>

            <div className="p-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-primary rounded-full mb-2">
                    {product.category_name || "Umum"}
                </span>

                <h3 className="text-xl font-bold truncate">{product.name}</h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {product.description}
                </p>

                <div className="flex justify-between items-center mt-2">
                    <p className="text-xl font-extrabold text-green-600 dark:text-green-400">
                        {product.price}
                    </p>
                    <span className="text-sm font-medium text-green-500">
                        Stok: {product.stock}
                    </span>
                </div>

                <button className="mt-4 w-full py-2 bg-dark-bg text-white rounded-md hover:opacity-80">
                    Lihat Detail
                </button>
            </div>
        </div>
    );
}
