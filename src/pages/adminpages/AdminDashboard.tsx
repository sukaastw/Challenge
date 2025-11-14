"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useProducts, Product } from "../../hooks/useProducts";
import "../../app/globals.css";

export default function AdminDashboard() {
  const { products, isLoading, isError, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  if (isError) return <p className="text-center py-10 text-red-600">Error loading products.</p>;

  const handleDelete = async (id: string | number) => {
    if (!confirm("Yakin ingin hapus produk?")) return;

    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Produk berhasil dihapus!");
    } catch {
      toast.error("Gagal menghapus produk.");
    }
  };

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || p.category?.name === selectedCategory)
  );

  const uniqueCategories = ["all", ...Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)))];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Manajemen Produk</h1>
          <Link href="/adminpages/add-product" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Tambah Produk
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
          >
            {uniqueCategories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center py-10 text-gray-700">Tidak ditemukan produk yang sesuai.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg shadow-sm text-black">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">Gambar</th>
                  <th className="p-3 border text-left">Nama</th>
                  <th className="p-3 border text-left">Kategori</th>
                  <th className="p-3 border text-right">Harga</th>
                  <th className="p-3 border text-center">Stok</th>
                  <th className="p-3 border text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p: Product, i) => (
                  <tr key={p.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="p-3 border text-center">{i + 1}</td>
                    <td className="p-3 border text-center">
                      <Image src={p.img_url} alt={p.name} width={64} height={64} className="object-cover rounded-md mx-auto border"/>
                    </td>
                    <td className="p-3 border">{p.name}</td>
                    <td className="p-3 border">{p.category?.name ?? "-"}</td>
                    <td className="p-3 border text-right font-semibold">Rp {Number(p.price).toLocaleString("id-ID")}</td>
                    <td className="p-3 border text-center">
                      <span className={`px-2 py-1 rounded-full text-white ${
                        Number(p.stock) > 10 ? "bg-green-600" : Number(p.stock) > 0 ? "bg-yellow-600" : "bg-red-700"
                      }`}>{p.stock}</span>
                    </td>
                    <td className="p-3 border text-center space-x-3">
                      <Link href={`/adminpages/edit-product/${p.id}`} className="text-indigo-600 hover:underline">Edit</Link>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
