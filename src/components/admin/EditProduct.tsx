// File: src/pages/adminpages/EditProduct.tsx

"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useProducts, Product } from "../../hooks/useProducts";
import "../../app/globals.css";

// Props untuk EditProduct
interface EditProductProps {
  productId: string;
}

// State form
interface EditFormData {
  name: string;
  price: string;
  stock: string;
  category: string;
  description: string;
  img: File | string | null;
}

export default function EditProduct({ productId }: EditProductProps) {
  const router = useRouter();
  const { getProductById, updateProduct } = useProducts();

  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    img: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load product by ID (hanya sekali)
  useEffect(() => {
    const product = getProductById(productId);
    if (!product) {
      toast.error("Produk tidak ditemukan.");
      return;
    }

    setFormData({
      name: product.name || "",
      price: String(product.price || ""),
      stock: String(product.stock || ""),
      category: product.category || "",
      description: product.description || "",
      // 💡 PERBAIKAN FINAL: Menggunakan format lh3.googleusercontent.com yang diminta
      img: product.fileId 
        ? `https://lh3.googleusercontent.com/u/0/d/${product.fileId}`
        : null,
    });
  }, [productId, getProductById]);

  // Handle input change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      const file = e.target.files?.[0] ?? null;
      setFormData((prev) => ({ ...prev, img: file }));
    } else {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast.error("⚠ Mohon isi semua data.");
      return;
    }

    setIsSubmitting(true);

    let imgBase64: string | undefined;

    // Type Narrowing Tegas untuk memproses file
    if (formData.img instanceof File) {
      const imageFile = formData.img as File; 
      
      try {
        imgBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } catch (err) {
        console.error("Gagal membaca gambar:", err);
        toast.error("Gagal membaca gambar.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const result = await updateProduct(productId, {
        id: productId,
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        description: formData.description,
        ...(imgBase64 ? { imgBase64 } : {}),
      });

      if (result.success) {
        toast.success("Produk berhasil diperbarui!");
        router.push("/adminpages");
      } else {
        toast.error(result.message || "Gagal memperbarui produk.");
      }
    } catch (err) {
      console.error("Server update error:", err);
      toast.error("Terjadi kesalahan server.");
    }

    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-md rounded-2xl p-6 space-y-4 text-gray-500"
    >
      <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 text-center">
        Edit Produk
      </h2>

      <div className="flex flex-col">
        <label>Nama Produk</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
      </div>

      <div className="flex flex-col">
        <label>Kategori</label>
        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
      </div>

      <div className="flex flex-col">
        <label>Harga</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
      </div>

      <div className="flex flex-col">
        <label>Stok</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
      </div>

      <div className="flex flex-col">
        <label>Deskripsi</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="border p-2 rounded-md"
        />
      </div>

      {/* Preview gambar lama */}
      {formData.img && typeof formData.img === "string" && (
        <div className="flex justify-center">
          <img
            src={formData.img}
            alt="Preview Gambar Lama"
            className="mt-2 w-32 h-32 object-cover rounded-md"
          />
        </div>
      )}

      {/* Upload Gambar Baru */}
      <div className="flex flex-col">
        <label>Gambar Produk (Upload Baru)</label>
        <input
          type="file"
          accept="image/*"
          name="img"
          onChange={handleChange}
          className="border p-2 rounded-md bg-gray-50"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
      </button>
    </form>
  );
}