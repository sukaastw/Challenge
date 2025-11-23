"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import "../../globals.css";
import { useProducts } from "../../../hooks/useProducts";

export default function ProductForm() {
  const router = useRouter();
  const { categories, isCategoriesLoading, createProduct } = useProducts();
  console.log("Data Kategori di Form:", categories);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    img: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Jika upload file
    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      const file = e.target.files?.[0] || null;
      setFormData({ ...formData, img: file });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validasi
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category ||
      !formData.img
    ) {
      toast.error("⚠ Mohon isi semua data termasuk gambar & kategori.");
      return;
    }

    setIsSubmitting(true);

    // Convert file → base64
    const convertToBase64 = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

    let base64Img = "";
    try {
      base64Img = await convertToBase64(formData.img);
    } catch (err) {
      toast.error("Gagal membaca gambar.");
      setIsSubmitting(false);
      return;
    }

    // Submit ke Apps Script
    try {
      const result = await createProduct({
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category, // sesuai category_name dari Sheet1
        description: formData.description,
        imgBase64: base64Img,
      });

      if (result.success) {
        toast.success("Produk berhasil disimpan!");
        router.push("/adminpages");
      } else {
        toast.error(result.message || "Gagal menyimpan produk.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server.");
    }

    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-md rounded-2xl p-6 space-y-4 text-gray-500"
    >
      <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
        Tambah Produk
      </h2>

      {/* Nama */}
      <div className="flex flex-col">
        <label>Nama Produk</label>
        <input
          name="name"
          onChange={handleChange}
          value={formData.name}
          className="border p-2 rounded-md"
        />
      </div>

      {/* Kategori */}
      <div className="flex flex-col">
        <label>Kategori</label>

        {isCategoriesLoading ? (
          <select disabled className="border p-2 bg-gray-100 rounded-md">
            <option>Memuat kategori...</option>
          </select>
        ) : (
          <select
            name="category"
            onChange={handleChange}
            value={formData.category}
            className="border p-2 rounded-md"
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((cat) => (
              <option key={String(cat.id)} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Harga */}
      <div className="flex flex-col">
        <label>Harga</label>
        <input
          name="price"
          type="number"
          onChange={handleChange}
          value={formData.price}
          className="border p-2 rounded-md"
        />
      </div>

      {/* Stok */}
      <div className="flex flex-col">
        <label>Stok</label>
        <input
          name="stock"
          type="number"
          onChange={handleChange}
          value={formData.stock}
          className="border p-2 rounded-md"
        />
      </div>

      {/* Deskripsi */}
      <div className="flex flex-col">
        <label>Deskripsi</label>
        <textarea
          name="description"
          rows={3}
          onChange={handleChange}
          value={formData.description}
          className="border p-2 rounded-md"
        />
      </div>

      {/* Upload Gambar */}
      <div className="flex flex-col">
        <label>Upload Gambar</label>
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
