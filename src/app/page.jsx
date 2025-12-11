"use client";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export default function Store() {
  const [items] = useState([
    { id: 1, name: "@VIP_User1", price: 150 },
    { id: 2, name: "@ProUser_99", price: 200 },
    { id: 3, name: "@UniqueNameX", price: 300 }
  ]);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function addToCart(item) {
    setCart((prev) => {
      const exists = prev.find((x) => x.id === item.id);
      if (exists)
        return prev.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { ...item, qty: 1 }];
    });
  }

  async function checkout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart })
    });

    const { sessionId } = await res.json();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId });
  }

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>متجر بيع يوزرات تيك توك</h1>

      <button onClick={() => setIsCartOpen(true)} style={{ marginTop: 20 }}>
        السلة ({cart.reduce((a, c) => a + c.qty, 0)})
      </button>

      <div style={{ marginTop: 30, display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: "1px solid #ddd", padding: 20, borderRadius: 12 }}>
            <h3>{item.name}</h3>
            <p>{item.price} ريال</p>
            <button onClick={() => addToCart(item)}>أضف للسلة</button>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div style={{ position: "fixed", top: 0, right: 0, width: 300, height: "100%", background: "white", padding: 20, borderLeft: "2px solid #ddd" }}>
          <h2>السلة</h2>
          {cart.map((item) => (
            <div key={item.id} style={{ marginBottom: 10 }}>
              {item.name} — {item.qty} × {item.price} ريال
            </div>
          ))}

          <hr />
          <p>الإجمالي: {total} ريال</p>

          <button onClick={checkout} style={{ marginTop: 20 }}>الدفع الآن</button>
          <button onClick={() => setIsCartOpen(false)} style={{ marginLeft: 10 }}>إغلاق</button>
        </div>
      )}
    </div>
  );
}
