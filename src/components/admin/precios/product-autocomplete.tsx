"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Package, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import http from "@/api/http-client";

interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string;
  price?: number;
  stock?: number;
}

interface ProductAutocompleteProps {
  value: string;
  onSelect: (product: Product) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductAutocomplete({
  value,
  onSelect,
  placeholder = "Buscar producto por código o nombre...",
  disabled = false,
}: ProductAutocompleteProps) {
  const { themeColors } = useTheme();
  const [searchQuery, setSearchQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar productos con debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setProducts([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await http.get("/products/my-distributor", {
          params: {
            page: 1,
            rowsPerPage: 20,
            search: searchQuery,
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = response.data as any;
        const productList = result.products || result.data || result;

        // Mapear productos del backend
        const mappedProducts: Product[] = (Array.isArray(productList) ? productList : []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => ({
            id: item.id || item.product_id,
            sku: item.sku || item.product_sku || item.productCode,
            name: item.name || item.product_name || item.productName,
            category: item.category,
            price: item.price || item.basePrice,
            stock: item.stock || item.inventory,
          })
        );

        setProducts(mappedProducts);
        setIsOpen(true);
      } catch (error) {
        console.error("Error buscando productos:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (product: Product) => {
    setSearchQuery(`${product.sku} - ${product.name}`);
    setIsOpen(false);
    onSelect(product);
  };

  const handleClear = () => {
    setSearchQuery("");
    setProducts([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: themeColors.text.secondary }}
        >
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.length >= 2 && products.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: themeColors.surface + "60",
            borderColor: themeColors.primary + "30",
            color: themeColors.text.primary,
            "--tw-ring-color": `${themeColors.primary}50`,
          } as React.CSSProperties}
        />

        {(isLoading || searchQuery) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: themeColors.primary }} />
            ) : searchQuery ? (
              <button
                onClick={handleClear}
                className="hover:opacity-70 transition-opacity"
                style={{ color: themeColors.text.secondary }}
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Dropdown de resultados */}
      <AnimatePresence>
        {isOpen && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 rounded-xl border shadow-lg overflow-hidden"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.primary + "30",
            }}
          >
            <div className="max-h-80 overflow-y-auto" style={{ backgroundColor: themeColors.surface }}>
              {products.map((product) => (
                <motion.button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 flex items-start gap-3 text-left transition-all border-b last:border-b-0"
                  style={{
                    borderColor: themeColors.primary + "10",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: themeColors.primary + "20",
                    }}
                  >
                    <Package className="w-5 h-5" style={{ color: themeColors.primary }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-sm truncate"
                          style={{ color: themeColors.text.primary }}
                        >
                          {product.name}
                        </p>
                        <p
                          className="text-xs font-mono mt-0.5"
                          style={{ color: themeColors.text.secondary }}
                        >
                          SKU: {product.sku}
                        </p>
                      </div>
                      {product.price && (
                        <span
                          className="text-sm font-semibold flex-shrink-0"
                          style={{ color: themeColors.accent }}
                        >
                          ${product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.category && (
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: themeColors.secondary + "20",
                            color: themeColors.secondary,
                          }}
                        >
                          {product.category}
                        </span>
                        {product.stock !== undefined && (
                          <span
                            className="text-xs"
                            style={{ color: themeColors.text.secondary }}
                          >
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div
              className="px-4 py-2 text-xs text-center border-t"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.primary + "20",
                color: themeColors.text.secondary,
              }}
            >
              {products.length} resultado{products.length !== 1 ? "s" : ""} encontrado
              {products.length !== 1 ? "s" : ""}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje cuando no hay resultados */}
      {isOpen && !isLoading && searchQuery.length >= 2 && products.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-full mt-2 p-4 rounded-xl border text-center"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.primary + "30",
            color: themeColors.text.secondary,
          }}
        >
          <p className="text-sm">No se encontraron productos</p>
          <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
        </motion.div>
      )}
    </div>
  );
}
