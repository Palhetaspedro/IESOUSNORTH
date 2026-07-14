import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";
import CountdownTimer from "../components/CountdownTimer";
import { products, priceRanges } from "../data/products";
import styles from "./Home.module.css";

const newProducts = products.filter(p => p.isNew);
const saleProducts = products.filter(p => p.discount > 0);
const bestSellers = products.filter(p => p.isBestSeller);

export default function Home() {
  return (
    <main>
      {/* Hero Banner */}
      <Banner />

      {/* Price Ranges */}
      <section className={styles.priceRanges}>
        <div className="container">
          <div className={styles.priceGrid}>
            {priceRanges.map(range => (
              <Link
                key={range.label}
                to={`/catalogo?maxPrice=${range.max}`}
                className={styles.priceBtn}
              >
                {range.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Drops Section */}
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
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Manifesto Band */}
      <section className={styles.manifesto}>
        <div className={styles.manifestoInner}>
          <p className={styles.manifestoText}>
            MAIS DO QUE ROUPAS — É UM POSICIONAMENTO.
          </p>
          <p className={styles.manifestoSub}>
            Cada peça carrega uma intenção. Cada estampa conta uma história.
          </p>
          <Link to="/sobre" className="btn-outline">NOSSA HISTÓRIA</Link>
        </div>
      </section>

      {/* Linha Cristã */}
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
              <Link to="/catalogo?categoria=cristã" className="btn-primary">
                VER LINHA CRISTÃ
              </Link>
            </div>
            <div className={styles.linhaProducts}>
              {products.filter(p => p.category === "cristã").slice(0, 2).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ofertas do Dia */}
      {saleProducts.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <CountdownTimer hours={6} label="Ofertas do dia" />
            <div className={styles.productGrid} style={{ marginTop: 32 }}>
              {saleProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
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
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA Newsletter */}
      <section className={styles.newsletter}>
        <div className="container">
          <div className={styles.newsletterInner}>
            <div>
              <h3 className={styles.nlTitle}>FIQUE POR DENTRO DOS DROPS</h3>
              <p className={styles.nlSub}>Seja o primeiro a saber quando um novo drop chega.</p>
            </div>
            <form
              className={styles.nlForm}
              onSubmit={e => { e.preventDefault(); alert("Inscrito!"); }}
            >
              <input
                type="email"
                placeholder="SEU E-MAIL"
                className={styles.nlInput}
                required
              />
              <button type="submit" className="btn-primary">INSCREVER</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
