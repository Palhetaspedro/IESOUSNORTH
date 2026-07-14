import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Heart, Shield, Truck, RefreshCcw } from "lucide-react";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";
import styles from "./ProductDetail.module.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const product = products.find(p => p.id === Number(id));

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [wished, setWished] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <p>Produto não encontrado.</p>
        <Link to="/catalogo" className="btn-outline">VOLTAR AO CATÁLOGO</Link>
      </div>
    );
  }

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAdd = () => {
    if (!selectedSize) { setError("Selecione um tamanho."); return; }
    if (!selectedColor) { setError("Selecione uma cor."); return; }
    setError("");
    addItem(product, selectedSize, selectedColor, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setError("Selecione um tamanho."); return; }
    if (!selectedColor) { setError("Selecione uma cor."); return; }
    addItem(product, selectedSize, selectedColor, 1);
    navigate("/carrinho");
  };

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <button onClick={() => navigate(-1)} className={styles.back}>
            <ArrowLeft size={16} /> VOLTAR
          </button>
          <span className={styles.crumbs}>
            <Link to="/">Início</Link>
            <span>/</span>
            <Link to="/catalogo">Catálogo</Link>
            <span>/</span>
            <span>{product.name}</span>
          </span>
        </div>

        <div className={styles.layout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.thumbnails}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${selectedImg === i ? styles.activeThumb : ""}`}
                  onClick={() => setSelectedImg(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className={styles.mainImage}>
              <img src={product.images[selectedImg]} alt={product.name} />
              {product.discount > 0 && (
                <div className={styles.discountBadge}>-{product.discount}% OFF</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.topInfo}>
              <span className={styles.line}>{product.line}</span>
              {product.tag && <span className="tag">{product.tag}</span>}
            </div>

            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.pricing}>
              {product.discount > 0 && (
                <span className={styles.original}>
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
              )}
              <span className={styles.price}>
                R$ {finalPrice.toFixed(2).replace(".", ",")}
              </span>
              <div className={styles.installments}>
                <span>3x R$ {(finalPrice / 3).toFixed(2).replace(".", ",")} sem juros</span>
                <span className={styles.pixDiscount}>
                  ou R$ {(finalPrice * 0.95).toFixed(2).replace(".", ",")} no PIX (-5%)
                </span>
              </div>
            </div>

            <hr className="divider" />

            {/* Color */}
            <div className={styles.option}>
              <p className={styles.optLabel}>
                COR: <strong>{selectedColor || "Selecione"}</strong>
              </p>
              <div className={styles.colorGrid}>
                {product.colors.map(c => (
                  <button
                    key={c}
                    className={`${styles.colorBtn} ${selectedColor === c ? styles.selected : ""}`}
                    onClick={() => setSelectedColor(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className={styles.option}>
              <p className={styles.optLabel}>
                TAMANHO: <strong>{selectedSize || "Selecione"}</strong>
              </p>
              <div className={styles.sizeGrid}>
                {product.sizes.map(s => (
                  <button
                    key={s}
                    className={`${styles.sizeBtn} ${selectedSize === s ? styles.selected : ""}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            {/* Actions */}
            <div className={styles.actions}>
              <button
                className={`${styles.addBtn} ${added ? styles.addedBtn : ""}`}
                onClick={handleAdd}
              >
                <ShoppingBag size={18} />
                {added ? "ADICIONADO AO CARRINHO!" : "ADICIONAR AO CARRINHO"}
              </button>
              <button className={styles.buyBtn} onClick={handleBuyNow}>
                COMPRAR AGORA
              </button>
              <button
                className={`${styles.wishBtn} ${wished ? styles.wished : ""}`}
                onClick={() => setWished(w => !w)}
              >
                <Heart size={18} fill={wished ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Description */}
            <div className={styles.desc}>
              <h3 className={styles.descTitle}>SOBRE A PEÇA</h3>
              <p className={styles.descText}>{product.description}</p>
              <ul className={styles.specs}>
                <li>320g de algodão penteado</li>
                <li>Corte oversized (ombros caídos)</li>
                <li>Costuras duplas reforçadas</li>
                <li>Estampa em serigrafia plastisol</li>
              </ul>
            </div>

            {/* Guarantees */}
            <div className={styles.guarantees}>
              <div className={styles.guarantee}>
                <Truck size={16} />
                <span>Entrega para todo o Brasil</span>
              </div>
              <div className={styles.guarantee}>
                <RefreshCcw size={16} />
                <span>30 dias para trocar</span>
              </div>
              <div className={styles.guarantee}>
                <Shield size={16} />
                <span>Compra 100% segura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className={styles.related}>
            <p className="section-title">VOCÊ TAMBÉM VAI GOSTAR</p>
            <div className={styles.relatedGrid}>
              {related.map(p => {
                const fp = p.discount ? p.price * (1 - p.discount / 100) : p.price;
                return (
                  <Link key={p.id} to={`/produto/${p.id}`} className={styles.relatedCard}>
                    <img src={p.images[0]} alt={p.name} />
                    <div className={styles.relatedInfo}>
                      <span className={styles.relatedName}>{p.name}</span>
                      <span className={styles.relatedPrice}>
                        R$ {fp.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
