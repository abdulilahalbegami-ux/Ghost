"use client";

import React from "react";
import { Check, AlertCircle, ShoppingCart } from "lucide-react";

interface Product {
  name: string;
  price: number;
  delivery: string;
  rating: string;
  source: string;
  isBest: boolean;
}

interface ProductComparerProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export const ProductComparer = ({ products, onSelect }: ProductComparerProps) => {
  return (
    <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10 text-white">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">Vertex Price Comparison</h4>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">3 Sources Scanned</span>
      </div>

      <div className="grid gap-3">
        {products.map((product, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
              product.isBest
                ? "bg-white/10 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                : "bg-black/40 border-white/5 hover:border-white/20"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{product.name}</span>
                {product.isBest && (
                  <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Best Option
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span>{product.source}</span>
                <span>•</span>
                <span>{product.delivery}</span>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="text-base font-bold">${product.price.toFixed(2)}</div>
              <button
                onClick={() => onSelect(product)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  product.isBest
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <ShoppingCart className="w-3 h-3" /> Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductComparer;