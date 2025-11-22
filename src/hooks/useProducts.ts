// File: src/hooks/useProducts.ts
import { useState, useEffect, useCallback } from "react";

export interface Product {
  id?: string | number;
  name: string;
  price: number | string;
  stock: number | string;
  category?: string;
  description?: string;
  imgBase64?: string;
  fileId?: string;
}

export interface Category {
  category_id: string | number;
  category_name: string;
}

const API_URL =
  "https://script.google.com/macros/s/AKfycbyzcvz_iSzjqAdxrrvS52LAAQkxSP1CED9fWl8UoGoIT5DbXziSoG8GDvXblSPkJK1Z/exec";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // =========================
  // Fetch Products & Categories
  // =========================
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const prod: Product[] = Array.isArray(data.products) ? data.products : [];
        const cats: Category[] = Array.isArray(data.categories)
          ? data.categories.map((c: any) => ({
              category_id: c.id || c.category_id,
              category_name: c.name || c.category_name,
            }))
          : [];

        setProducts(prod);
        setCategories(cats);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
        setCategories([]);
        setIsError(true);
      } finally {
        setIsLoading(false);
        setIsCategoriesLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // =========================
  // Get Product By ID
  // =========================
  const getProductById = useCallback(
    (id: string | number) => products.find((p) => String(p.id) === String(id)),
    [products]
  );

  // =========================
  // Create Product
  // =========================
  const createProduct = useCallback(async (data: Product) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", target: "product", data }),
      });
      const result = await res.json();

      if (result.success) {
        setProducts((prev) => [...prev, { ...data, id: result.id, fileId: result.fileId }]);
      }

      return result;
    } catch (err) {
      console.error("Failed to create product:", err);
      return { success: false, message: String(err) };
    }
  }, []);

  // =========================
  // Update Product
  // =========================
  const updateProduct = useCallback(async (id: string | number, data: Partial<Product>) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", target: "product", data: { ...data, id } }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const result = await res.json();

      if (result.success) {
        setProducts((prev) =>
          prev.map((p) => (String(p.id) === String(id) ? { ...p, ...data } : p))
        );
      }

      return result;
    } catch (err) {
      console.error("Failed to update product:", err);
      return { success: false, message: String(err) };
    }
  }, []);

  // =========================
  // Delete Product
  // =========================
  const deleteProduct = {
    mutateAsync: useCallback(async (id: string | number) => {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", target: "product", data: { id } }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();

        if (result.success) {
          setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
        }

        return result;
      } catch (err) {
        console.error("Failed to delete product:", err);
        return { success: false, message: String(err) };
      }
    }, []),
  };

  return {
    products,
    categories,
    isLoading,
    isError,
    isCategoriesLoading,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
