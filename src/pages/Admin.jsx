import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Megaphone, Calendar, Package, BarChart2, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { products, metrics } from "../data/products";
import styles from "./Admin.module.css";

const tabs = [
  { id: "dashboard", label: "DASHBOARD", icon: BarChart2 },
  { id: "produtos", label: "PRODUTOS", icon: Package },
  { id: "lancamentos", label: "LANÇAMENTOS", icon: Calendar },
  { id: "anuncios", label: "ANÚNCIOS", icon: Megaphone },
];

const emptyProduct = {
  name: "", category: "streetwear", price: "", cost: "26",
  description: "", sizes: "P,M,G,GG,XGG", stock: "", tag: "", line: "Linha Streetwear"
};

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [launchDate, setLaunchDate] = useState({ productId: "", date: "", time: "" });
  const [announcement, setAnnouncement] = useState({ title: "", text: "", start: "", end: "", active: true });
  const [savedMsg, setSavedMsg] = useState("");

  const upProd = (f, v) => setNewProduct(p => ({ ...p, [f]: v }));
  const upAnn = (f, v) => setAnnouncement(a => ({ ...a, [f]: v }));

  const showSaved = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 3000);
  };

  // Protect route
  if (!user) {
    return (
      <div className={styles.guard}>
        <AlertTriangle size={40} />
        <h2>ACESSO NEGADO</h2>
        <p>Você precisa estar logado para acessar esta área.</p>
        <button className="btn-primary" onClick={() => navigate("/login")}>FAZER LOGIN</button>
      </div>
    );
  }

  // Metrics
  const totalRevenue = metrics.grossRevenue;
  const totalCost = products.length * metrics.cost * 10;
  const netMargin = ((metrics.priceStreet - metrics.cost) / metrics.priceStreet * 100).toFixed(0);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className="section-title">PAINEL ADMINISTRATIVO</p>
            <h1 className={styles.title}>OLÁ, {user.name?.toUpperCase() || "ADMIN"}</h1>
          </div>
          {savedMsg && <div className={styles.toast}>{savedMsg}</div>}
        </div>

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`${styles.navBtn} ${activeTab === tab.id ? styles.active : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Content */}
          <div className={styles.content}>
            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>VISÃO GERAL — DROP 01 & 02</h2>
                <div className={styles.metricsGrid}>
                  {[
                    { label: "RECEITA BRUTA (PIX)", value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, sub: "60 peças vendidas" },
                    { label: "TICKET MÉDIO", value: `R$ ${(totalRevenue / metrics.totalPieces).toFixed(2).replace(".", ",")}`, sub: "Streetwear + Cristã" },
                    { label: "MARGEM LÍQUIDA", value: `${netMargin}%`, sub: `Custo R$ ${metrics.cost}/peça` },
                    { label: "META DO DROP", value: "60 peças", sub: `${metrics.totalPieces} vendáveis` },
                  ].map(m => (
                    <div key={m.label} className={styles.metricCard}>
                      <span className={styles.metricLabel}>{m.label}</span>
                      <span className={styles.metricValue}>{m.value}</span>
                      <span className={styles.metricSub}>{m.sub}</span>
                    </div>
                  ))}
                </div>

                <h3 className={styles.subTitle}>PRODUTOS CADASTRADOS</h3>
                <div className={styles.productList}>
                  {products.map(p => (
                    <div key={p.id} className={styles.productRow}>
                      <img src={p.images[0]} alt={p.name} className={styles.productThumb} />
                      <div className={styles.productRowInfo}>
                        <span className={styles.productRowName}>{p.name}</span>
                        <span className={styles.productRowLine}>{p.line}</span>
                      </div>
                      <span className={styles.productRowStock}>
                        {p.stock} un.
                      </span>
                      <span className={styles.productRowPrice}>
                        R$ {p.price.toFixed(2).replace(".", ",")}
                      </span>
                      <span className={`${styles.productRowStatus} ${p.isNew ? styles.statusNew : ""}`}>
                        {p.isNew ? "NOVO" : "ATIVO"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionar Produto */}
            {activeTab === "produtos" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>CADASTRAR NOVO PRODUTO</h2>
                <form className={styles.form} onSubmit={e => {
                  e.preventDefault();
                  if (!newProduct.name || !newProduct.price) { alert("Preencha nome e preço."); return; }
                  showSaved(`✓ Produto "${newProduct.name}" adicionado com sucesso!`);
                  setNewProduct(emptyProduct);
                }}>
                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Nome do produto *</label>
                      <input className="form-input" placeholder="EX: CAMISETA SIGMA CORE"
                        value={newProduct.name} onChange={e => upProd("name", e.target.value.toUpperCase())} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tag de exibição</label>
                      <input className="form-input" placeholder="EX: DROP 01, OFERTA"
                        value={newProduct.tag} onChange={e => upProd("tag", e.target.value.toUpperCase())} />
                    </div>
                  </div>

                  <div className={styles.row3}>
                    <div className="form-group">
                      <label className="form-label">Linha</label>
                      <select className="form-input" value={newProduct.line}
                        onChange={e => upProd("line", e.target.value)} style={{ cursor: "pointer" }}>
                        <option>Linha Streetwear</option>
                        <option>Linha Cristã</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preço de venda (R$) *</label>
                      <input type="number" step="0.01" className="form-input" placeholder="69.90"
                        value={newProduct.price} onChange={e => upProd("price", e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Custo (R$)</label>
                      <input type="number" step="0.01" className="form-input"
                        value={newProduct.cost} onChange={e => upProd("cost", e.target.value)} />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Tamanhos disponíveis</label>
                      <input className="form-input" placeholder="P,M,G,GG,XGG"
                        value={newProduct.sizes} onChange={e => upProd("sizes", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estoque inicial</label>
                      <input type="number" className="form-input" placeholder="60"
                        value={newProduct.stock} onChange={e => upProd("stock", e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descrição da peça</label>
                    <textarea className="form-input" rows={4}
                      placeholder="Descreva o produto, tecido, caimento..."
                      value={newProduct.description}
                      onChange={e => upProd("description", e.target.value)}
                      style={{ resize: "vertical" }} />
                  </div>

                  {newProduct.price && newProduct.cost && (
                    <div className={styles.marginPreview}>
                      <span>💰 Margem estimada:</span>
                      <strong>
                        {((Number(newProduct.price) - Number(newProduct.cost)) / Number(newProduct.price) * 100).toFixed(1)}%
                      </strong>
                      <span>— Lucro: R$ {(Number(newProduct.price) - Number(newProduct.cost)).toFixed(2).replace(".", ",")}/peça</span>
                    </div>
                  )}

                  <div className={styles.saveRow}>
                    <button type="submit" className="btn-primary">
                      <PlusCircle size={16} />
                      ADICIONAR PRODUTO
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lançamentos */}
            {activeTab === "lancamentos" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>AGENDAR LANÇAMENTO</h2>
                <p className={styles.panelSub}>
                  Defina quando um produto ficará visível no catálogo. O produto será ativado automaticamente na data e hora configuradas.
                </p>
                <form className={styles.form} onSubmit={e => {
                  e.preventDefault();
                  showSaved(`✓ Lançamento agendado para ${launchDate.date} às ${launchDate.time}!`);
                  setLaunchDate({ productId: "", date: "", time: "" });
                }}>
                  <div className="form-group">
                    <label className="form-label">Produto *</label>
                    <select className="form-input" value={launchDate.productId}
                      onChange={e => setLaunchDate(l => ({ ...l, productId: e.target.value }))}
                      style={{ cursor: "pointer" }} required>
                      <option value="">Selecione um produto</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Data do lançamento *</label>
                      <input type="date" className="form-input" value={launchDate.date}
                        onChange={e => setLaunchDate(l => ({ ...l, date: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Horário *</label>
                      <input type="time" className="form-input" value={launchDate.time}
                        onChange={e => setLaunchDate(l => ({ ...l, time: e.target.value }))} required />
                    </div>
                  </div>

                  {/* Scheduled List */}
                  <div className={styles.scheduledList}>
                    <h4 className={styles.subTitle}>DROPS AGENDADOS</h4>
                    <div className={styles.emptyScheduled}>
                      <Calendar size={32} strokeWidth={1} style={{ color: "var(--border)" }} />
                      <span>Nenhum drop agendado ainda.</span>
                    </div>
                  </div>

                  <div className={styles.saveRow}>
                    <button type="submit" className="btn-primary">
                      <Calendar size={16} />
                      AGENDAR LANÇAMENTO
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Anúncios */}
            {activeTab === "anuncios" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>CRIAR ANÚNCIO</h2>
                <p className={styles.panelSub}>
                  Os anúncios aparecem na barra do topo do site e nos banners da home. Configure título, texto e período de exibição.
                </p>
                <form className={styles.form} onSubmit={e => {
                  e.preventDefault();
                  showSaved(`✓ Anúncio "${announcement.title}" criado com sucesso!`);
                  setAnnouncement({ title: "", text: "", start: "", end: "", active: true });
                }}>
                  <div className="form-group">
                    <label className="form-label">Título do anúncio *</label>
                    <input className="form-input" placeholder="EX: DROP 02 — DISPONÍVEL AGORA"
                      value={announcement.title}
                      onChange={e => upAnn("title", e.target.value.toUpperCase())} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Texto completo *</label>
                    <textarea className="form-input" rows={3}
                      placeholder="EX: 🚀 DROP 02 DISPONÍVEL — APENAS 60 PEÇAS — FRETE GRÁTIS ACIMA DE R$ 199,90"
                      value={announcement.text}
                      onChange={e => upAnn("text", e.target.value)}
                      style={{ resize: "vertical" }} required />
                  </div>
                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Data de início</label>
                      <input type="date" className="form-input"
                        value={announcement.start} onChange={e => upAnn("start", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Data de fim</label>
                      <input type="date" className="form-input"
                        value={announcement.end} onChange={e => upAnn("end", e.target.value)} />
                    </div>
                  </div>
                  <label className={styles.toggleRow}>
                    <input type="checkbox" checked={announcement.active}
                      onChange={e => upAnn("active", e.target.checked)} />
                    <span className={styles.toggleLabel}>Ativar anúncio imediatamente</span>
                  </label>

                  {announcement.text && (
                    <div className={styles.preview}>
                      <span className={styles.previewLabel}>PRÉ-VISUALIZAÇÃO DA BARRA:</span>
                      <div className={styles.previewBar}>{announcement.text}</div>
                    </div>
                  )}

                  <div className={styles.saveRow}>
                    <button type="submit" className="btn-primary">
                      <Megaphone size={16} />
                      PUBLICAR ANÚNCIO
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
