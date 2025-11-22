const API_URL = "https://script.google.com/macros/s/AKfycbyfA0xBLayxaprd9FtynqKGwFiEYO1SP6-eEhkyWxbg3eee1fB2eLxg_qF_YLmt668x/exec";

// GET ALL PRODUCTS
export async function getProducts() {
  const res = await fetch(API_URL);
  return res.json();
}

// ADD PRODUCT
export async function addProduct(product: any) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "create",
      product,
    }),
  });
  return res.json();
}

// UPDATE PRODUCT
export async function updateProduct(product: any) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "update",
      product,
    }),
  });
  return res.json();
}

// DELETE PRODUCT
export async function deleteProduct(id: number) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "delete",
      id,
    }),
  });
  return res.json();
}
