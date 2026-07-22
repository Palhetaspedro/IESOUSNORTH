import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";
import { categories } from "../data/products";
import styles from "./Catalog.module.css";

const adapt = (p) => ({
  ...p,
  isNew: p.is_new,
  isBestSeller: p.is_best_seller,
  discount: p.discount || 0,
  images: p.images?.length ? p.images : [],
  sizes: p.sizes || [],
  colors: p.colors || [],
});

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("novidades");
  const [selectedCat, setSelectedCat] = useState("todos");
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchQ = params.get("q") || "";
  const genderParam = params.get("gender") || "";

  useEffect(() => {
    const cat = params.get("categoria");
    if (cat) setSelectedCat(cat);
    const mp = params.get("maxPrice");
    if (mp) setMaxPrice(Number(mp));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCat, maxPrice, sort, searchQ, genderParam]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (searchQ) {
        query = query.ilike("name", `%${searchQ}%`);
      }

      if (selectedCat !== "todos") {
        if (selectedCat === "novidades") query = query.eq("is_new", true);
        else if (selectedCat === "ofertas") query = query.gt("discount", 0);
        else query = query.eq("category", selectedCat);
      }

      if (genderParam) {
        query = query.eq("gender", genderParam);
      }

      if (maxPrice !== Infinity) {
        query = query.lte("price", maxPrice);
      }

      switch (sort) {
        case "menor-preco": query = query.order("price", { ascending: true }); break;
        case "maior-preco": query = query.order("price", { ascending: false }); break;
        case "desconto": query = query.order("discount", { ascending: false }); break;
        default: query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCat("todos");
    setMaxPrice(Infinity);
    setParams({});
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            {searchQ && <p className="section-title">BUSCA: "{searchQ}"</p>}
            <h1 className={styles.title}>
              {selectedCat === "todos" ? "TODOS OS PRODUTOS" : selectedCat.toUpperCase()}
            </h1>
            <p className={styles.count}>{products.length} produtos encontrados</p>
          </div>
          <div className={styles.controls}>
            <button className={styles.filterToggle} onClick={() => setFiltersOpen(o => !o)}>
              <SlidersHorizontal size={16} /> FILTROS
            </button>
            <div className={styles.sortWrapper}>
              <select className={styles.sort} value={sort}
                onChange={e => setSort(e.target.value)}>
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
          <aside className={`${styles.sidebar} ${filtersOpen ? styles.open : ""}`}>
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarTitle}>FILTROS</span>
              <button className={styles.closeFilters} onClick={() => setFiltersOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>CATEGORIA</h4>
              {categories.map(cat => (
                <button key={cat.id}
                  className={`${styles.filterBtn} ${selectedCat === cat.id ? styles.active : ""}`}
                  onClick={() => setSelectedCat(cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>GÊNERO</h4>
              {[
                { id: "todos-generos", label: "TODOS", val: "" },
                { id: "masculino", label: "MASCULINO", val: "masculino" },
                { id: "feminino", label: "FEMININO", val: "feminino" },
                { id: "unissex", label: "UNISSEX", val: "unissex" },
              ].map(g => (
                <button key={g.id}
                  className={`${styles.filterBtn} ${genderParam === g.val ? styles.active : ""}`}
                  onClick={() => setParams(p => {
                    const next = new URLSearchParams(p);
                    g.val ? next.set("gender", g.val) : next.delete("gender");
                    return next;
                  })}>
                  {g.label}
                </button>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.filterTitle}>PREÇO MÁX.</h4>
              {[
                { label: "Até R$ 69,90", val: 69.90 },
                { label: "Até R$ 89,90", val: 89.90 },
                { label: "Todos", val: Infinity },
              ].map(opt => (
                <button key={opt.label}
                  className={`${styles.filterBtn} ${maxPrice === opt.val ? styles.active : ""}`}
                  onClick={() => setMaxPrice(opt.val)}>
                  {opt.label}
                </button>
              ))}
            </div>

            {(selectedCat !== "todos" || maxPrice !== Infinity || genderParam) && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                LIMPAR FILTROS
              </button>
            )}
          </aside>

          <div className={styles.gridArea}>
            {loading ? (
              <div className={styles.loadingGrid}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>Nenhum produto encontrado.</p>
                <button className="btn-outline" onClick={clearFilters}>
                  LIMPAR FILTROS
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {products.map(p => (
                  <ProductCard key={p.id} product={adapt(p)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}