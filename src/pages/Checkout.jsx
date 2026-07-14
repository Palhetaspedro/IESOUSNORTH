import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, Copy, CreditCard, Smartphone, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import styles from "./Checkout.module.css";

const STEPS = ["ENDEREÇO", "PAGAMENTO", "CONFIRMAÇÃO"];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState("pix");
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: "", name: "", expiry: "", cvv: "", installments: "1"
  });

  const [addr, setAddr] = useState({
    name: user?.name || "", email: user?.email || "",
    address: user?.address || "", city: user?.city || "",
    state: user?.state || "", zip: ""
  });

  const frete = subtotal >= 199.90 ? 0 : 12.90;
  const pixDiscount = subtotal * 0.05;
  const totalPix = subtotal + frete - pixDiscount;
  const totalCard = subtotal + frete;

  const total = payment === "pix" ? totalPix : totalCard;

  const upAddr = (f, v) => setAddr(a => ({ ...a, [f]: v }));
  const upCard = (f, v) => setCardForm(c => ({ ...c, [f]: v }));

  const handleCopyPix = () => {
    navigator.clipboard.writeText("00020126360014BR.GOV.BCB.PIX0114+5561999999999520400005303986540" + totalPix.toFixed(2) + "5802BR5913SIGMA STORE6008BRASILIA62090505SIGMA6304ABCD");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirm = () => {
    clearCart();
    setConfirmed(true);
  };

  const formatCard = (v) => v.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);

  if (items.length === 0 && !confirmed) {
    navigate("/carrinho");
    return null;
  }

  // Confirmed state
  if (confirmed) {
    return (
      <div className={styles.success}>
        <div className={styles.successCard}>
          <CheckCircle size={64} className={styles.successIcon} />
          <h1 className={styles.successTitle}>PEDIDO CONFIRMADO!</h1>
          <p className={styles.successSub}>
            Você receberá um e-mail em <strong>{user?.email}</strong> com os detalhes.
          </p>
          <div className={styles.successOrder}>
            <span className={styles.orderLabel}>NÚMERO DO PEDIDO</span>
            <span className={styles.orderNum}>#SIGMA{Math.floor(Math.random() * 90000 + 10000)}</span>
          </div>
          <Link to="/" className="btn-primary">VOLTAR À HOME</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s} className={styles.stepItem}>
              <div className={`${styles.stepDot} ${i <= step ? styles.stepActive : ""}`}>
                {i + 1}
              </div>
              <span className={`${styles.stepLabel} ${i <= step ? styles.stepLabelActive : ""}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineFill : ""}`} />}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Left - Steps */}
          <div className={styles.left}>
            {/* Step 0: Address */}
            {step === 0 && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>ENDEREÇO DE ENTREGA</h2>
                <div className={styles.form}>
                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Nome completo *</label>
                      <input className="form-input" value={addr.name}
                        onChange={e => upAddr("name", e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">E-mail *</label>
                      <input type="email" className="form-input" value={addr.email}
                        onChange={e => upAddr("email", e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Endereço *</label>
                    <input className="form-input" placeholder="Rua, número, bairro"
                      value={addr.address} onChange={e => upAddr("address", e.target.value)} required />
                  </div>
                  <div className={styles.row3}>
                    <div className="form-group">
                      <label className="form-label">Cidade *</label>
                      <input className="form-input" value={addr.city}
                        onChange={e => upAddr("city", e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">UF *</label>
                      <input className="form-input" placeholder="GO" maxLength={2}
                        value={addr.state} onChange={e => upAddr("state", e.target.value.toUpperCase())} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CEP *</label>
                      <input className="form-input" placeholder="00000-000"
                        value={addr.zip} onChange={e => upAddr("zip", e.target.value)} required />
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => {
                    if (!addr.name || !addr.email || !addr.address || !addr.city || !addr.zip) {
                      alert("Preencha todos os campos obrigatórios."); return;
                    }
                    setStep(1);
                  }}>
                    CONTINUAR PARA PAGAMENTO
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className={styles.panel}>
                <div className={styles.panelBackRow}>
                  <button className={styles.backBtn} onClick={() => setStep(0)}>
                    <ArrowLeft size={14} /> ENDEREÇO
                  </button>
                </div>
                <h2 className={styles.panelTitle}>FORMA DE PAGAMENTO</h2>

                {/* Payment Tabs */}
                <div className={styles.payTabs}>
                  {[
                    { id: "pix", label: "PIX", icon: <Smartphone size={16} /> },
                    { id: "credito", label: "CRÉDITO", icon: <CreditCard size={16} /> },
                    { id: "debito", label: "DÉBITO", icon: <CreditCard size={16} /> },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      className={`${styles.payTab} ${payment === opt.id ? styles.payTabActive : ""}`}
                      onClick={() => setPayment(opt.id)}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* PIX */}
                {payment === "pix" && (
                  <div className={styles.pixPanel}>
                    <div className={styles.pixBadge}>5% de desconto no PIX!</div>
                    <div className={styles.pixQr}>
                      <div className={styles.qrPlaceholder}>
                        <Smartphone size={48} strokeWidth={1} />
                        <span>QR CODE PIX</span>
                      </div>
                    </div>
                    <p className={styles.pixInstructions}>
                      Abra o app do seu banco, escaneie o QR Code ou copie o código abaixo.
                      O pedido é confirmado em até 5 minutos após o pagamento.
                    </p>
                    <button className={styles.copyBtn} onClick={handleCopyPix}>
                      <Copy size={14} />
                      {copied ? "COPIADO!" : "COPIAR CÓDIGO PIX"}
                    </button>
                    <div className={styles.pixTotal}>
                      <span>Total com PIX:</span>
                      <strong>R$ {totalPix.toFixed(2).replace(".", ",")}</strong>
                    </div>
                    <button className="btn-primary" style={{ width: "100%", marginTop: 16 }}
                      onClick={() => setStep(2)}>
                      CONFIRMAR PAGAMENTO VIA PIX
                    </button>
                  </div>
                )}

                {/* Cartão */}
                {(payment === "credito" || payment === "debito") && (
                  <div className={styles.cardPanel}>
                    <div className={styles.form}>
                      <div className="form-group">
                        <label className="form-label">Número do cartão</label>
                        <input className="form-input" placeholder="0000 0000 0000 0000"
                          value={cardForm.number}
                          onChange={e => upCard("number", formatCard(e.target.value))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Nome no cartão</label>
                        <input className="form-input" placeholder="COMO ESTÁ NO CARTÃO"
                          value={cardForm.name}
                          onChange={e => upCard("name", e.target.value.toUpperCase())} />
                      </div>
                      <div className={styles.row2}>
                        <div className="form-group">
                          <label className="form-label">Validade</label>
                          <input className="form-input" placeholder="MM/AA"
                            value={cardForm.expiry}
                            onChange={e => upCard("expiry", formatExpiry(e.target.value))} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV</label>
                          <input className="form-input" placeholder="000" maxLength={4}
                            value={cardForm.cvv}
                            onChange={e => upCard("cvv", e.target.value.replace(/\D/g, ""))} />
                        </div>
                      </div>
                      {payment === "credito" && (
                        <div className="form-group">
                          <label className="form-label">Parcelas</label>
                          <select className="form-input" value={cardForm.installments}
                            onChange={e => upCard("installments", e.target.value)}
                            style={{ cursor: "pointer" }}>
                            {[1, 2, 3, 6, 12].map(n => (
                              <option key={n} value={n}>
                                {n}x de R$ {(totalCard / n).toFixed(2).replace(".", ",")}
                                {n <= 3 ? " sem juros" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <button className="btn-primary" style={{ width: "100%" }}
                        onClick={() => {
                          if (!cardForm.number || !cardForm.name || !cardForm.expiry || !cardForm.cvv) {
                            alert("Preencha os dados do cartão."); return;
                          }
                          setStep(2);
                        }}>
                        CONFIRMAR PAGAMENTO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className={styles.panel}>
                <div className={styles.panelBackRow}>
                  <button className={styles.backBtn} onClick={() => setStep(1)}>
                    <ArrowLeft size={14} /> PAGAMENTO
                  </button>
                </div>
                <h2 className={styles.panelTitle}>REVISAR PEDIDO</h2>

                <div className={styles.reviewSection}>
                  <h4 className={styles.reviewTitle}>ENTREGA</h4>
                  <p className={styles.reviewText}>{addr.name}</p>
                  <p className={styles.reviewText}>{addr.address}</p>
                  <p className={styles.reviewText}>{addr.city} — {addr.state} · {addr.zip}</p>
                </div>

                <div className={styles.reviewSection}>
                  <h4 className={styles.reviewTitle}>PAGAMENTO</h4>
                  <p className={styles.reviewText}>
                    {payment === "pix" && `PIX — R$ ${totalPix.toFixed(2).replace(".", ",")}`}
                    {payment === "credito" && `Cartão de Crédito — ${cardForm.installments}x de R$ ${(totalCard / Number(cardForm.installments)).toFixed(2).replace(".", ",")}`}
                    {payment === "debito" && `Cartão de Débito — R$ ${totalCard.toFixed(2).replace(".", ",")}`}
                  </p>
                </div>

                <div className={styles.reviewSection}>
                  <h4 className={styles.reviewTitle}>ITENS</h4>
                  {items.map(item => {
                    const fp = item.product.discount
                      ? item.product.price * (1 - item.product.discount / 100)
                      : item.product.price;
                    return (
                      <div key={item.key} className={styles.reviewItem}>
                        <img src={item.product.images[0]} alt={item.product.name} className={styles.reviewImg} />
                        <div className={styles.reviewItemInfo}>
                          <span className={styles.reviewItemName}>{item.product.name}</span>
                          <span className={styles.reviewItemMeta}>
                            {item.size} · {item.color} · Qtd: {item.qty}
                          </span>
                        </div>
                        <span className={styles.reviewItemPrice}>
                          R$ {(fp * item.qty).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button className={styles.confirmBtn} onClick={handleConfirm}>
                  <CheckCircle size={18} />
                  CONFIRMAR PEDIDO — R$ {total.toFixed(2).replace(".", ",")}
                </button>
              </div>
            )}
          </div>

          {/* Right - Summary */}
          <aside className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>RESUMO DO PEDIDO</h3>
            <div className={styles.summaryItems}>
              {items.map(item => {
                const fp = item.product.discount
                  ? item.product.price * (1 - item.product.discount / 100)
                  : item.product.price;
                return (
                  <div key={item.key} className={styles.summaryItem}>
                    <div className={styles.summaryImg}>
                      <img src={item.product.images[0]} alt={item.product.name} />
                      <span className={styles.summaryQtyBadge}>{item.qty}</span>
                    </div>
                    <div className={styles.summaryItemInfo}>
                      <span className={styles.summaryItemName}>{item.product.name}</span>
                      <span className={styles.summaryItemMeta}>{item.size} · {item.color}</span>
                    </div>
                    <span className={styles.summaryItemPrice}>
                      R$ {(fp * item.qty).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                );
              })}
            </div>
            <hr className="divider" />
            <div className={styles.summaryTotals}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              {payment === "pix" && (
                <div className={`${styles.summaryRow} ${styles.green}`}>
                  <span>Desconto PIX (5%)</span>
                  <span>- R$ {pixDiscount.toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Frete</span>
                <span>{frete === 0 ? "GRÁTIS" : `R$ ${frete.toFixed(2).replace(".", ",")}`}</span>
              </div>
              <hr className="divider" />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>TOTAL</span>
                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
