import { useState, useEffect } from "react";

export interface Product {
  id: string | number;
  name: string;
  category?: { name: string };
  price: number | string;
  stock: number | string;
  img_url: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsError(true);
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const deleteProduct = {
    mutateAsync: async (id: string | number) => {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p.id !== id));
      }
      return data;
    }
  };

  return { products, isLoading, isError, deleteProduct };
}
