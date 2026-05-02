"use client";

interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-100 text-red-700">
        Sin stock
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-yellow-100 text-yellow-700">
        {stock} bajo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700">
      {stock}
    </span>
  );
}
