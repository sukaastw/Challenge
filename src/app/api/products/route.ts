// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";

export interface Product {
  id: string | number;
  name: string;
  category?: { name: string };
  price: number | string;
  stock: number | string;
  img_url: string;
}

// Ambil data dari Google Sheet publik
export async function GET(req: NextRequest) {
  const SHEET_ID = "13oaL7bbFFx9GGhEKSUt9-HbOkv7nksmqGW6t7oF5Dgc"; // ganti dengan ID Sheet kamu
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  try {
    const res = await fetch(SHEET_URL);
    let text = await res.text();

    // Hapus prefix Google Sheet
    text = text.replace("/*O_o*/\ngoogle.visualization.Query.setResponse(", "").slice(0, -2);
    const data = JSON.parse(text);
    const rows = data.table.rows;

    const products: Product[] = rows.map((r: any, i: number) => {
      const fileId = r.c[5]?.v ?? "";
      // Konversi File ID ke URL publik Google Drive
       const imgUrl = fileId
    ? `https://lh3.googleusercontent.com/d/${fileId}`: "";

      return {
        id: r.c[0]?.v ?? i + 1,
        name: r.c[1]?.v ?? "",
        category: { name: r.c[2]?.v ?? "" },
        price: Number(r.c[3]?.v ?? 0),
        stock: Number(r.c[4]?.v ?? 0),
        img_url: imgUrl,
      };
    });

    //console.log("Produk:", products);

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching Sheet:", error);
    return NextResponse.json({ error: "Gagal mengambil data dari Google Sheet" }, { status: 500 });
  }
}

// Dummy DELETE untuk tombol Hapus
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
  }

  console.log("Hapus produk dengan ID:", id);
  return NextResponse.json({ success: true });
}
