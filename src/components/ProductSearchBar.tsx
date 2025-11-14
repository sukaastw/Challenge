import React from "react";

interface Props {
  onSearch: (value: string) => void;
}

export default function ProductSearchBar({ onSearch }: Props) {
  return (
    <input
      type="text"
      placeholder="Cari produk..."
      onChange={(e) => onSearch(e.target.value)}
      className="px-4 py-2 border rounded-md w-full"
    />
  );
}
