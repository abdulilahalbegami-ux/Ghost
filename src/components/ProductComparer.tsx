"use client";

import React, { useState } from "react";
import { Check, AlertCircle, ShoppingCart, Star, ThumbsUp, ThumbsDown } from "lucide-react";

interface Product {
  name: string;
  price: number;
  delivery: string;
  rating: string;
  source: string;
  isBest: boolean;
  score: number;
  pros: string[];
  cons: string[];
  features: Record<string, string | boolean>;
}

interface ProductComparerProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export const ProductComparer = ({ products, onSelect }: ProductComparerProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);

  return (
    <div className="space-y-4 bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-white/60">Vertex Price Comparison</h4>
          <p className="text-[9px] text-zinc-400 dark:text-white/40">Real-time market scanning & recommendation engine</p>
        </div>
        <span className="text-[10px] bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-zinc-600 dark:text-white/80">
          {products.length} Sources Scanned
        </span>
      </div>

      <div className="grid gap-3">
        {products.map((product, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedProduct(product)}
            className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
              selectedProduct?.name === product.name
                ? "bg-zinc-100 dark:bg-white/10 border-zinc-400 dark:border-white/40 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                : "bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{product.name}</span>
                {product.isBest && (
                  <span className="text-[9px] bg-zinc-900 text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Best Option
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-white/60">
                <span>{product.source}</span>
                <span>•</span>
                <span>{product.delivery}</span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-base font-bold font-mono">${product.price.toFixed(2)}</div>
              <div className="flex items-center gap-1 justify-end text-[10px] text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                <span>{product.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Recommendation & Feature Matrix */}
      {selectedProduct && (
        <div className="mt-4 p-4 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Vertex Recommendation Score</span>
            </div>
            <span className="text-sm font-bold font-mono text-indigo-500">{selectedProduct.score}/100</span>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> Pros
              </span>
              <ul className="space-y-1">
                {(selectedProduct.pros || ["Cheapest option", "Fast delivery"]).map((pro, idx) => (
                  <li key={idx} className="text-xs text-zinc-600 dark:text-white/70 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-rose-500 flex items-center gap-1">
                <ThumbsDown className="w-3 h-3" /> Cons
              </span>
              <ul className="space-y-1">
                {(selectedProduct.cons || ["Limited customization", "Slightly longer wait"]).map((con, idx) => (
                  <li key={idx} className="text-xs text-zinc-600 dark:text-white/70 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-500" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature Matrix */}
          {selectedProduct.features && (
            <div className="space-y-1.5 border-t border-zinc-200 dark:border-white/5 pt-3">
              <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-white/40">Feature Matrix</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedProduct.features).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-1.5 bg-white dark:bg-white/5 rounded border border-zinc-100 dark:border-white/5">
                    <span className="text-zinc-500 dark:text-white/50 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="font-semibold">
                      {typeof val === "boolean" ? (val ? "Yes" : "No") : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onSelect(selectedProduct)}
            className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Select {selectedProduct.name}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductComparer;