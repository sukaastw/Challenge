// src/pages/adminpages/editproduct/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import EditProduct from "@/components/admin/EditProduct"; // pakai alias lebih rapi

export default function Page() {
  const params = useParams();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) return <p>Produk ID tidak valid</p>;

  return <EditProduct productId={id} />;
}
