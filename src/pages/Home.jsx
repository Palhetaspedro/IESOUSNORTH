import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";
import CountdownTimer from "../components/CountdownTimer";
import { supabase } from "../lib/supabase";
import { priceRanges } from "../data/products";
import styles from "./Home.module.css";

const adapt = (p) => ({
  ...p,
  isNew: p.is_new,
  isBestSeller: p.is_best_seller,
  discount: p.discount || 0,
  images: p.images || [],
  sizes: p.sizes || [],
  colors: p.colors || [],
});

export default function Home() {
  const [newProducts, setNewProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [christianLine, setChristianLine] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      const all = data || [];
      setNewProducts(all.filter(p => p.is_new).slice(0, 3));
      setSaleProducts(all.filter(p => p.discount > 0).slice(0, 4));
      setBestSellers(all.filter(p => p.is_best_seller).slice(0, 3));
      setChristianLine(all.filter(p => p.category === "cristã").slice(0, 2));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ProductSkeleton = () => (
    <div className={styles.skeleton} />
  );

  return (
    <main>
      <Banner />

      {/* Price Ranges */}
      <section className={styles.priceRanges}>
        <div className="container">
          <div className={styles.priceGrid}>
            {priceRanges.map(range => (
              <Link key={range.label} to={`/catalogo?maxPrice=${range.max}`} className={styles.priceBtn}>
                {range.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Novidades */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className="section-title">COLEÇÃO ATUAL</p>
              <h2 className={styles.sectionHeadline}>OS DROPS</h2>
            </div>
            <Link to="/catalogo?categoria=novidades" className={styles.viewAll}>
              VER TUDO <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.productGrid}>
            {loading
              ? [...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)
              : newProducts.map(p => <ProductCard key={p.id} product={adapt(p)} />)
            }
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className={styles.manifesto}>
        <div className={styles.manifestoInner}>
          <p className={styles.manifestoText}>MAIS DO QUE ROUPAS — É UM POSICIONAMENTO.</p>
          <p className={styles.manifestoSub}>Cada peça carrega uma intenção. Cada estampa conta uma história.</p>
          <Link to="/sobre" className="btn-outline">NOSSA HISTÓRIA</Link>
        </div>
      </section>

      {/* Linha Cristã */}
      {(loading || christianLine.length > 0) && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.linhaGrid}>
              <div className={styles.linhaInfo}>
                <p className="section-title">EXCLUSIVO</p>
                <h2 className={styles.sectionHeadline}>LINHA CRISTÃ</h2>
                <p className={styles.linhaDesc}>
                  Estampas que carregam a palavra com autenticidade.
                  Algodão pesado 320g, corte oversized, mensagem que dura.
                </p>
                <div className={styles.linhaStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNum}>320g</span>
                    <span className={styles.statLabel}>ALGODÃO PESADO</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNum}>60</span>
                    <span className={styles.statLabel}>PEÇAS LIMITADAS</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNum}>R$ 89</span>
                    <span className={styles.statLabel}>PREÇO JUSTO</span>
                  </div>
                </div>
                <Link to="/catalogo?categoria=cristã" className="btn-primary">VER LINHA CRISTÃ</Link>
              </div>
              <div className={styles.linhaProducts}>
                {loading
                  ? [...Array(2)].map((_, i) => <div key={i} className={styles.skeleton} />)
                  : christianLine.map(p => <ProductCard key={p.id} product={adapt(p)} />)
                }
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ofertas do Dia */}
      {(loading || saleProducts.length > 0) && (
        <section className={styles.section}>
          <div className="container">
            <CountdownTimer hours={6} label="Ofertas do dia" />
            <div className={styles.productGrid} style={{ marginTop: 32 }}>
              {loading
                ? [...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)
                : saleProducts.map(p => <ProductCard key={p.id} product={adapt(p)} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* Mais Vendidos */}
      {(loading || bestSellers.length > 0) && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <p className="section-title">MAIS VENDIDOS</p>
                <h2 className={styles.sectionHeadline}>FAVORITOS</h2>
              </div>
              <Link to="/catalogo" className={styles.viewAll}>
                VER TUDO <ArrowRight size={14} />
              </Link>
            </div>
            <div className={styles.productGrid}>
              {loading
                ? [...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)
                : bestSellers.map(p => <ProductCard key={p.id} product={adapt(p)} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className="container">
          <div className={styles.newsletterInner}>
            <div>
              <h3 className={styles.nlTitle}>FIQUE POR DENTRO DOS DROPS</h3>
              <p className={styles.nlSub}>Seja o primeiro a saber quando um novo drop chegar.</p>
            </div>
            <form className={styles.nlForm} onSubmit={e => { e.preventDefault(); alert("Inscrito!"); }}>
              <input type="email" placeholder="SEU E-MAIL" className={styles.nlInput} required />
              <button type="submit" className="btn-primary">INSCREVER</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}