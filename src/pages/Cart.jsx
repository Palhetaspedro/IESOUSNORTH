import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import styles from "./Cart.module.css";

const FRETE_OPTIONS = [
  { id: "pac", label: "PAC", days: "8-15 dias úteis", price: 0, description: "Grátis acima de R$ 199,90" },
  { id: "sedex", label: "SEDEX", days: "2-4 dias úteis", price: 19.90, description: "Entrega expressa" },
  { id: "retirada", label: "RETIRADA", days: "Combinar", price: 0, description: "Retire pessoalmente" },
];

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, subtotal, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [frete, setFrete] = useState("pac");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const freteOption = FRETE_OPTIONS.find(f => f.id === frete);
  const freteVal = subtotal >= 199.90 ? 0 : freteOption.price;
  const total = subtotal + freteVal - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "SIGMA10") {
      setDiscount(subtotal * 0.1);
    } else {
      setDiscount(0);
      alert("Cupom inválido.");
    }
  };

  const handleCheckout = () => {
    if (!user) { navigate("/login?redirect=/checkout"); return; }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <ShoppingBag size={64} strokeWidth={1} className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>SEU CARRINHO ESTÁ VAZIO</h2>
        <p className={styles.emptyText}>Explore nossos produtos e adicione o que você curtiu.</p>
        <Link to="/catalogo" className="btn-primary">VER CATÁLOGO</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>CARRINHO</h1>
          <span className={styles.count}>{totalItems} {totalItems === 1 ? "ITEM" : "ITENS"}</span>
        </div>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.itemsCol}>
            <div className={styles.items}>
              {items.map(item => {
                const fp = item.product.discount
                  ? item.product.price * (1 - item.product.discount / 100)
                  : item.product.price;
                return (
                  <div key={item.key} className={styles.item}>
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className={styles.itemImg}
                    />
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTop}>
                        <div>
                          <p className={styles.itemLine}>{item.product.line}</p>
                          <p className={styles.itemName}>{item.product.name}</p>
                          <p className={styles.itemMeta}>
                            Tamanho: {item.size} · Cor: {item.color}
                          </p>
                        </div>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeItem(item.key)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className={styles.itemBottom}>
                        <div className={styles.qtyControl}>
                          <button
                            onClick={() => updateQty(item.key, item.qty - 1)}
                            className={styles.qtyBtn}
                          >
                            <Minus size={12} />
                          </button>
                          <span className={styles.qty}>{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.key, item.qty + 1)}
                            className={styles.qtyBtn}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className={styles.itemPrice}>
                          R$ {(fp * item.qty).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className={styles.clearBtn} onClick={clearCart}>
              LIMPAR CARRINHO
            </button>
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            {/* Frete */}
            <div className={styles.summaryBlock}>
              <h3 className={styles.summaryTitle}>FRETE</h3>
              {FRETE_OPTIONS.map(opt => (
                <label key={opt.id} className={styles.freteOption}>
                  <input
                    type="radio"
                    name="frete"
                    value={opt.id}
                    checked={frete === opt.id}
                    onChange={() => setFrete(opt.id)}
                    className={styles.radio}
                  />
                  <div className={styles.freteInfo}>
                    <span className={styles.freteLabel}>{opt.label}</span>
                    <span className={styles.freteDays}>{opt.days}</span>
                    <span className={styles.freteDesc}>{opt.description}</span>
                  </div>
                  <span className={styles.fretePrice}>
                    {(frete === opt.id && subtotal >= 199.90 && opt.id === "pac")
                      ? "GRÁTIS"
                      : opt.price === 0 ? "GRÁTIS" : `R$ ${opt.price.toFixed(2).replace(".", ",")}`}
                  </span>
                </label>
              ))}
            </div>

            {/* Coupon */}
            <div className={styles.summaryBlock}>
              <h3 className={styles.summaryTitle}>CUPOM</h3>
              <div className={styles.couponRow}>
                <input
                  type="text"
                  placeholder="CÓDIGO DO CUPOM"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value.toUpperCase())}
                  className="form-input"
                />
                <button className="btn-outline" onClick={applyCoupon}>
                  APLICAR
                </button>
              </div>
              <p className={styles.couponHint}>Tente: SIGMA10 (10% OFF)</p>
            </div>

            {/* Totals */}
            <div className={styles.summaryBlock}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              {discount > 0 && (
                <div className={`${styles.totalRow} ${styles.discountRow}`}>
                  <span>Desconto (cupom)</span>
                  <span>- R$ {discount.toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className={styles.totalRow}>
                <span>Frete</span>
                <span>{freteVal === 0 ? "GRÁTIS" : `R$ ${freteVal.toFixed(2).replace(".", ",")}`}</span>
              </div>
              <hr className="divider" style={{ margin: "12px 0" }} />
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>TOTAL</span>
                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
              <p className={styles.pixHint}>
                R$ {(total * 0.95).toFixed(2).replace(".", ",")} no PIX (5% off)
              </p>
            </div>

            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              FINALIZAR COMPRA <ArrowRight size={16} />
            </button>

            <Link to="/catalogo" className={styles.continueShopping}>
              CONTINUAR COMPRANDO
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
