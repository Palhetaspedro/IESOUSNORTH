import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    addItem(product, product.sizes[0], product.colors[0], 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.card}>
      {/* Image Area */}
      <Link to={`/produto/${product.id}`} className={styles.imageLink}>
        <div
          className={styles.imageWrapper}
          onMouseEnter={() => product.images[1] && setImgIdx(1)}
          onMouseLeave={() => setImgIdx(0)}
        >
          <img
            src={product.images[imgIdx]}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />

          {/* Badges */}
          <div className={styles.badges}>
            {product.isNew && <span className={styles.badge}>NOVO</span>}
            {product.discount > 0 && (
              <span className={`${styles.badge} ${styles.discount}`}>
                -{product.discount}%
              </span>
            )}
            {product.isBestSeller && (
              <span className={`${styles.badge} ${styles.best}`}>
                MAIS VENDIDO
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            className={`${styles.wish} ${wished ? styles.wished : ""}`}
            onClick={e => { e.preventDefault(); setWished(w => !w); }}
          >
            <Heart size={16} fill={wished ? "currentColor" : "none"} />
          </button>

          {/* Quick Add */}
          <button
            className={`${styles.quickAdd} ${added ? styles.added : ""}`}
            onClick={handleQuickAdd}
          >
            <ShoppingBag size={14} />
            {added ? "ADICIONADO!" : "ADICIONAR"}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className={styles.info}>
        <span className={styles.line}>{product.line}</span>
        <Link to={`/produto/${product.id}`} className={styles.name}>
          {product.name}
        </Link>
        <div className={styles.pricing}>
          {product.discount > 0 && (
            <span className={styles.original}>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
          )}
          <span className={styles.price}>
            R$ {finalPrice.toFixed(2).replace(".", ",")}
          </span>
          <span className={styles.installment}>
            3x R$ {(finalPrice / 3).toFixed(2).replace(".", ",")} s/ juros
          </span>
        </div>

        {/* Sizes */}
        <div className={styles.sizes}>
          {product.sizes.map(s => (
            <span key={s} className={styles.size}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
