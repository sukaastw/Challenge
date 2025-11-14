// src/lib/google-sheets.js
import axios from "axios";

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = "Products";

// URL export CSV (gunakan mode CSV)
const EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

function parseCsv(csvText) {
    if (!csvText) return [];

    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const headers =
        lines[0].match(/(?:[^,"]+|"[^"]*")+/g)?.map((h) => h.replace(/^"|"$/g, "").trim()) || [];

    const items = [];

    for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        if (!rawLine.trim()) continue;

        const columns =
            rawLine.match(/(?:[^,"]+|"[^"]*")+/g)?.map((c) => c.replace(/^"|"$/g, "").trim()) || [];

        const row = {};
        headers.forEach((h, index) => {
            row[h] = columns[index] || "";
        });

        // URL gambar langsung dari Drive CDN
        const imgUrl = row.img_drive_id
            ? `https://lh3.googleusercontent.com/d/${row.img_drive_id}`
            : "/placeholder-image.png";

        items.push({
            id: row.product_id || "",
            name: row.name || "",
            slug: row.slug || "",
            description: row.description || "",
            category_name: row.category_name || "",
            price: parseFloat(row.price) || 0,
            stock: parseInt(row.stock, 10) || 0,
            img_drive_id: row.img_drive_id || "",
            img_url: imgUrl,
        });
    }

    return items.filter((item) => item.name !== "");
}

export async function fetchProductsFromSheet() {
    if (!SHEET_ID) {
        console.warn("❗ SHEET_ID belum dibuat di .env.local");
        return [];
    }

    try {
        const response = await axios.get(EXPORT_URL, {
            responseType: "text",
        });

        const products = parseCsv(response.data);

        return products;
    } catch (error) {
        console.error("❌ Error fetch sheet:", error.message);
        return [];
    }
}
