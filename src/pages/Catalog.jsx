import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { products, categories } from "../data/products";
import styles from "./Catalog.module.css";

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("novidades");
  const [selectedCat, setSelectedCat] = useState(params.get("categoria") || "todos");
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const searchQ = params.get("q") || "";

  useEffect(() => {
    const cat = params.get("categoria");
    if (cat) setSelectedCat(cat);
    const mp = params.get("maxPrice");
    if (mp) setMaxPrice(Number(mp));
  }, [params]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCat !== "todos") {
      if (selectedCat === "novidades") list = list.filter(p => p.isNew);
      else if (selectedCat === "ofertas") list = list.filter(p => p.discount > 0);
      else list = list.filter(p => p.category === selectedCat);
    }

    if (maxPrice !== Infinity) {
      list = list.filter(p => {
        const fp = p.discount ? p.price * (1 - p.discount / 100) : p.price;
        return fp <= maxPrice;
      });
    }

    switch (sort) {
      case "menor-preco":
        list.sort((a, b) => a.price - b.price); break;
      case "maior-preco":
        list.sort((a, b) => b.price - a.price); break;
      case "desconto":
        list.sort((a, b) => b.discount - a.discount); break;
      default:
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return list;
  }, [selectedCat, maxPrice, sort, searchQ]);

  const clearFilters = () => {
    setSelectedCat("todos");
    setMaxPrice(Infinity);
    setParams({});
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            {searchQ && (
              <p className="section-title">BUSCA: "{searchQ}"</p>
            )}
            <h1 className={styles.title}>
              {selectedCat === "todos" ? "TODOS OS PRODUTOS" : selectedCat.toUpperCase()}
            </h1>
            <p className={styles.count}>{filtered.length} produtos encontrados</p>
          </div>
          <div className={styles.controls}>
            <button
              className={styles.filterToggle}
              onClick={() => setFiltersOpen(o => !o)}
            >
              <SlidersHorizontal size={16} />
              FILTROS
            </button>
            <div className={styles.sortWrapper}>
              <select
                className={styles.sort}
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="novidades">Mais Recentes</option>
                <option value="menor-preco">Menor Preço</option>
                <option value="maior-preco">Maior Preço</option>
                <option value="desconto">Maior Desconto</option>
              </select>
              <ChevronDown size={14} className={styles.sortIcon} />
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div className={styles.layout}>
          {/* Sidebar Filters */}
          <aside className={`${styles.sidebar} ${filtersOpen ? styles.open : ""}`}>
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarTitle}>FILTROS</span>
              <button
                className={styles.closeFilters}
                onClick={() => setFiltersOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Categories */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>CATEGORIA</h4>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.filterBtn} ${selectedCat === cat.id ? styles.active : ""}`}
                  onClick={() => setSelectedCat(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Price */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>PREÇO MÁX.</h4>
              {[
                { label: "Até R$ 69,90", val: 69.90 },
                { label: "Até R$ 89,90", val: 89.90 },
                { label: "Todos", val: Infinity },
              ].map(opt => (
                <button
                  key={opt.label}
                  className={`${styles.filterBtn} ${maxPrice === opt.val ? styles.active : ""}`}
                  onClick={() => setMaxPrice(opt.val)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {(selectedCat !== "todos" || maxPrice !== Infinity) && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                LIMPAR FILTROS
              </button>
            )}
          </aside>

          {/* Grid */}
          <div className={styles.gridArea}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>Nenhum produto encontrado.</p>
                <button className="btn-outline" onClick={clearFilters}>
                  LIMPAR FILTROS
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
