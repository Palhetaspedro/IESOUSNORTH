import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  PlusCircle, Megaphone, Calendar, Package,
  BarChart2, Upload, X, AlertTriangle,
  Pencil, Trash2, Check, ArrowLeft
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import styles from "./Admin.module.css";

const tabs = [
  { id: "dashboard", label: "DASHBOARD", icon: BarChart2 },
  { id: "produtos", label: "PRODUTOS", icon: Package },
  { id: "novo", label: "NOVO PRODUTO", icon: PlusCircle },
  { id: "lancamentos", label: "LANÇAMENTOS", icon: Calendar },
  { id: "anuncios", label: "ANÚNCIOS", icon: Megaphone },
];

const emptyProduct = {
  name: "", category: "streetwear", line: "Linha Streetwear",
  price: "", cost: "26", discount: "0", description: "",
  sizes: "P,M,G,GG,XGG", colors: "Preto", stock: "", tag: "",
  is_new: true, is_best_seller: false,
  gender: "unissex", // ← adicione aqui
};

export default function Admin() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Novo produto
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  // Edição
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImages, setEditImages] = useState([]);
  const [editPreviews, setEditPreviews] = useState([]);
  const [editUploading, setEditUploading] = useState(false);
  const editFileRef = useRef();

  // Anúncio
  const [announcement, setAnnouncement] = useState({
    title: "", text: "", start: "", end: "", active: true
  });

  // Launch
  const [launchDate, setLaunchDate] = useState({ productId: "", date: "", time: "" });

  // Feedback
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Proteção de rota
  if (!user || profile?.role !== "admin") {
    return (
      <div className={styles.guard}>
        <AlertTriangle size={48} />
        <h2>ACESSO RESTRITO</h2>
        <p>Esta área é exclusiva para administradores.</p>
        <Link to="/" className="btn-primary">VOLTAR À HOME</Link>
      </div>
    );
  }

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoadingProducts(false);
  };

  // ─── Upload de imagens ───────────────────────────
  const handleImageSelect = (e, isEdit = false) => {
    const files = Array.from(e.target.files);
    const current = isEdit ? editImages : images;
    if (files.length + current.length > 4) {
      showToast("Máximo de 4 fotos.", "error"); return;
    }
    const urls = files.map(f => URL.createObjectURL(f));
    if (isEdit) {
      setEditImages(prev => [...prev, ...files]);
      setEditPreviews(prev => [...prev, ...urls]);
    } else {
      setImages(prev => [...prev, ...files]);
      setPreviews(prev => [...prev, ...urls]);
    }
    e.target.value = "";
  };

  const removeImage = (idx, isEdit = false) => {
    if (isEdit) {
      setEditImages(prev => prev.filter((_, i) => i !== idx));
      setEditPreviews(prev => prev.filter((_, i) => i !== idx));
    } else {
      setImages(prev => prev.filter((_, i) => i !== idx));
      setPreviews(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const removeExistingImage = (idx) => {
    setEditForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== idx)
    }));
  };

  const uploadImages = async (productId, files) => {
    const urls = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("products")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("products").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  // ─── Salvar novo produto ─────────────────────────
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | success | error

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      setSaveStatus("error");
      showToast("Preencha nome, preço e estoque.", "error");
      return;
    }
    if (images.length === 0) {
      setSaveStatus("error");
      showToast("Adicione pelo menos 1 foto.", "error");
      return;
    }

    setSaveStatus("saving");
    setUploading(true);

    try {
      const { data: product, error } = await supabase
        .from("products")
        .insert({
          name: newProduct.name,
          category: newProduct.category,
          line: newProduct.line,
          price: Number(newProduct.price),
          cost: Number(newProduct.cost),
          discount: Number(newProduct.discount),
          description: newProduct.description,
          sizes: newProduct.sizes.split(",").map(s => s.trim()),
          colors: newProduct.colors.split(",").map(c => c.trim()),
          stock: Number(newProduct.stock),
          tag: newProduct.tag || null,
          is_new: newProduct.is_new,
          is_best_seller: newProduct.is_best_seller,
          gender: newProduct.gender,
          is_active: true,
          images: [],
        })
        .select()
        .single();

      if (error) throw error;

      const imageUrls = await uploadImages(product.id, images);
      await supabase.from("products").update({ images: imageUrls }).eq("id", product.id);

      setSaveStatus("success");
      showToast(`✓ "${newProduct.name}" adicionado com sucesso!`);

      // Reseta o formulário após 2 segundos mostrando o sucesso
      setTimeout(() => {
        setNewProduct(emptyProduct);
        setImages([]);
        setPreviews([]);
        setSaveStatus("idle");
        fetchProducts();
        setActiveTab("produtos");
      }, 2000);

    } catch (err) {
      setSaveStatus("error");
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // ─── Iniciar edição ──────────────────────────────
  const startEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      ...product,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(",") : product.sizes,
      colors: Array.isArray(product.colors) ? product.colors.join(",") : product.colors,
      images: product.images || [],
    });
    setEditImages([]);
    setEditPreviews([]);
    setActiveTab("edit");
  };

  // ─── Salvar edição ───────────────────────────────
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditUploading(true);
    try {
      let imageUrls = editForm.images || [];

      if (editImages.length > 0) {
        const newUrls = await uploadImages(editingProduct.id, editImages);
        imageUrls = [...imageUrls, ...newUrls];
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: editForm.name,
          category: editForm.category,
          line: editForm.line,
          price: Number(editForm.price),
          cost: Number(editForm.cost),
          discount: Number(editForm.discount),
          description: editForm.description,
          sizes: editForm.sizes.split(",").map(s => s.trim()),
          colors: editForm.colors.split(",").map(c => c.trim()),
          stock: Number(editForm.stock),
          tag: editForm.tag || null,
          is_new: editForm.is_new,
          is_best_seller: editForm.is_best_seller,
          is_active: editForm.is_active,
          images: imageUrls,
          gender: editForm.gender,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      showToast(`✓ "${editForm.name}" atualizado!`);
      setEditingProduct(null);
      setActiveTab("produtos");
      fetchProducts();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setEditUploading(false);
    }
  };

  // ─── Deletar produto ─────────────────────────────
  const handleDelete = async (product) => {
    if (!confirm(`Deletar "${product.name}"? Esta ação não pode ser desfeita.`)) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      showToast(`Erro: ${error.message}`, "error");
      return;
    }

    // Remove direto do estado sem precisar rebuscar no banco
    setProducts(prev => prev.filter(p => p.id !== product.id));
    showToast(`"${product.name}" removido com sucesso.`);
  };

  // ─── Salvar anúncio ──────────────────────────────
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("announcements").insert({
      title: announcement.title,
      message: announcement.text,
      is_active: announcement.active,
      starts_at: announcement.start || null,
      ends_at: announcement.end || null,
      created_by: user.id,
    });
    if (error) { showToast(error.message, "error"); return; }
    showToast(`✓ Anúncio publicado!`);
    setAnnouncement({ title: "", text: "", start: "", end: "", active: true });
  };

  // ─── Salvar lançamento ───────────────────────────
  const handleSaveLaunch = async (e) => {
    e.preventDefault();
    const dt = `${launchDate.date}T${launchDate.time}:00`;
    const { error } = await supabase
      .from("products")
      .update({ launch_date: dt, is_new: true })
      .eq("id", launchDate.productId);
    if (error) { showToast(error.message, "error"); return; }
    showToast(`✓ Lançamento agendado!`);
    setLaunchDate({ productId: "", date: "", time: "" });
    fetchProducts();
  };

  const upEdit = (f, v) => setEditForm(p => ({ ...p, [f]: v }));
  const upNew = (f, v) => setNewProduct(p => ({ ...p, [f]: v }));
  const upAnn = (f, v) => setAnnouncement(a => ({ ...a, [f]: v }));

  const totalStock = products.reduce((a, p) => a + (p.stock || 0), 0);
  const avgMargin = products.length
    ? (products.reduce((a, p) => a + ((p.price - p.cost) / p.price), 0) / products.length * 100).toFixed(0)
    : 0;

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Toast */}
        {toast.msg && (
          <div className={toast.type === "error" ? styles.toastError : styles.toast}>
            {toast.msg}
          </div>
        )}

        <div className={styles.pageHeader}>
          <div>
            <p className="section-title">PAINEL ADMINISTRATIVO</p>
            <h1 className={styles.title}>IΣSOUS ADMIN</h1>
          </div>
          <Link to="/" className={styles.backToSite}>
            <ArrowLeft size={14} /> VER SITE
          </Link>
        </div>

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.adminUser}>
              <div className={styles.adminAvatar}>
                {(profile?.name || user.email)?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className={styles.adminName}>{profile?.name || "Admin"}</p>
                <p className={styles.adminRole}>ADMINISTRADOR</p>
              </div>
            </div>

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

          {/* Conteúdo */}
          <div className={styles.content}>

            {/* ── DASHBOARD ── */}
            {activeTab === "dashboard" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>VISÃO GERAL</h2>

                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>PRODUTOS</span>
                    <span className={styles.metricValue}>{products.length}</span>
                    <span className={styles.metricSub}>cadastrados</span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>ESTOQUE TOTAL</span>
                    <span className={styles.metricValue}>{totalStock}</span>
                    <span className={styles.metricSub}>unidades</span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>MARGEM MÉDIA</span>
                    <span className={styles.metricValue}>{avgMargin}%</span>
                    <span className={styles.metricSub}>lucro/peça</span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>RECEITA POTENCIAL</span>
                    <span className={styles.metricValue}>
                      R$ {products.reduce((a, p) => a + p.price * p.stock, 0)
                        .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className={styles.metricSub}>estoque × preço</span>
                  </div>
                </div>

                <div className={styles.quickActions}>
                  <button className={styles.quickBtn} onClick={() => setActiveTab("novo")}>
                    <PlusCircle size={16} /> NOVO PRODUTO
                  </button>
                  <button className={styles.quickBtn} onClick={() => setActiveTab("anuncios")}>
                    <Megaphone size={16} /> CRIAR ANÚNCIO
                  </button>
                  <button className={styles.quickBtn} onClick={() => setActiveTab("lancamentos")}>
                    <Calendar size={16} /> AGENDAR DROP
                  </button>
                </div>

                <h3 className={styles.subTitle}>PRODUTOS RECENTES</h3>
                <div className={styles.productList}>
                  {loadingProducts
                    ? [...Array(3)].map((_, i) => <div key={i} className={styles.skeletonRow} />)
                    : products.slice(0, 5).map(p => (
                      <div key={p.id} className={styles.productRow}>
                        <div className={styles.productThumbWrap}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} className={styles.productThumb} />
                            : <div className={styles.noImg}><Package size={16} /></div>
                          }
                        </div>
                        <div className={styles.productRowInfo}>
                          <span className={styles.productRowName}>{p.name}</span>
                          <span className={styles.productRowLine}>{p.line}</span>
                        </div>
                        <span className={styles.productRowStock}>{p.stock} un.</span>
                        <span className={styles.productRowPrice}>
                          R$ {Number(p.price).toFixed(2).replace(".", ",")}
                        </span>
                        <span className={`${styles.productRowStatus} ${p.is_new ? styles.statusNew : ""}`}>
                          {p.is_new ? "NOVO" : "ATIVO"}
                        </span>
                        <button className={styles.editIconBtn} onClick={() => startEdit(p)}>
                          <Pencil size={13} />
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* ── LISTA DE PRODUTOS ── */}
            {activeTab === "produtos" && (
              <div className={styles.panel}>
                <div className={styles.panelTitleRow}>
                  <h2 className={styles.panelTitle}>TODOS OS PRODUTOS</h2>
                  <button className="btn-primary" onClick={() => setActiveTab("novo")}>
                    <PlusCircle size={14} /> NOVO
                  </button>
                </div>

                {loadingProducts ? (
                  [...Array(4)].map((_, i) => <div key={i} className={styles.skeletonRow} />)
                ) : products.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Package size={40} strokeWidth={1} />
                    <p>Nenhum produto cadastrado ainda.</p>
                    <button className="btn-primary" onClick={() => setActiveTab("novo")}>
                      ADICIONAR PRIMEIRO PRODUTO
                    </button>
                  </div>
                ) : (
                  <div className={styles.productList}>
                    {products.map(p => (
                      <div key={p.id} className={styles.productRow}>
                        <div className={styles.productThumbWrap}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} className={styles.productThumb} />
                            : <div className={styles.noImg}><Package size={16} /></div>
                          }
                        </div>
                        <div className={styles.productRowInfo}>
                          <span className={styles.productRowName}>{p.name}</span>
                          <span className={styles.productRowLine}>
                            {p.line} · {p.category} · {p.tag || "—"}
                          </span>
                        </div>
                        <span className={styles.productRowStock}>{p.stock} un.</span>
                        <span className={styles.productRowPrice}>
                          R$ {Number(p.price).toFixed(2).replace(".", ",")}
                        </span>
                        <span className={`${styles.productRowStatus} ${p.is_new ? styles.statusNew : ""} ${!p.is_active ? styles.statusInactive : ""}`}>
                          {!p.is_active ? "INATIVO" : p.is_new ? "NOVO" : "ATIVO"}
                        </span>
                        <div className={styles.rowActions}>
                          <button className={styles.editIconBtn} onClick={() => startEdit(p)}
                            title="Editar">
                            <Pencil size={13} />
                          </button>
                          <button className={styles.deleteIconBtn} onClick={() => handleDelete(p)}
                            title="Deletar">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── EDITAR PRODUTO ── */}
            {activeTab === "edit" && editingProduct && (
              <div className={styles.panel}>
                <div className={styles.panelTitleRow}>
                  <h2 className={styles.panelTitle}>EDITAR PRODUTO</h2>
                  <button className={styles.backBtn} onClick={() => setActiveTab("produtos")}>
                    <ArrowLeft size={14} /> VOLTAR
                  </button>
                </div>

                <form className={styles.form} onSubmit={handleSaveEdit}>
                  {/* Fotos existentes */}
                  <div className={styles.uploadArea}>
                    <p className={styles.fieldLabel}>FOTOS ATUAIS</p>
                    <div className={styles.previewGrid}>
                      {(editForm.images || []).map((url, i) => (
                        <div key={i} className={styles.previewItem}>
                          <img src={url} alt={`foto ${i}`} />
                          <button type="button" className={styles.removeImg}
                            onClick={() => removeExistingImage(i)}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {editPreviews.map((url, i) => (
                        <div key={`new-${i}`} className={styles.previewItem}>
                          <img src={url} alt={`nova ${i}`} />
                          <button type="button" className={styles.removeImg}
                            onClick={() => removeImage(i, true)}>
                            <X size={12} />
                          </button>
                          <span className={styles.newBadge}>NOVA</span>
                        </div>
                      ))}
                      {(editForm.images || []).length + editPreviews.length < 4 && (
                        <button type="button" className={styles.uploadBtn}
                          onClick={() => editFileRef.current.click()}>
                          <Upload size={18} />
                          <span>ADICIONAR</span>
                        </button>
                      )}
                    </div>
                    <input ref={editFileRef} type="file" accept="image/*" multiple
                      style={{ display: "none" }}
                      onChange={e => handleImageSelect(e, true)} />
                  </div>

                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Nome *</label>
                      <input className="form-input" value={editForm.name}
                        onChange={e => upEdit("name", e.target.value.toUpperCase())} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tag</label>
                      <input className="form-input" value={editForm.tag || ""}
                        onChange={e => upEdit("tag", e.target.value.toUpperCase())} />
                    </div>
                  </div>

                  <div className={styles.row3}>
                    <div className="form-group">
                      <label className="form-label">Linha</label>
                      <select className="form-input" value={editForm.line}
                        onChange={e => upEdit("line", e.target.value)} style={{ cursor: "pointer" }}>
                        <option>Linha Streetwear</option>
                        <option>Linha Cristã</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Categoria</label>
                      <select className="form-input" value={editForm.category}
                        onChange={e => upEdit("category", e.target.value)} style={{ cursor: "pointer" }}>
                        <option value="streetwear">Streetwear</option>
                        <option value="cristã">Cristã</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gênero</label>
                      <select className="form-input" value={editForm.gender || "unissex"}
                        onChange={e => upEdit("gender", e.target.value)} style={{ cursor: "pointer" }}>
                        <option value="unissex">Unissex</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.row3}>
                    <div className="form-group">
                      <label className="form-label">Preço (R$) *</label>
                      <input type="number" step="0.01" className="form-input" value={editForm.price}
                        onChange={e => upEdit("price", e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Custo (R$)</label>
                      <input type="number" step="0.01" className="form-input" value={editForm.cost}
                        onChange={e => upEdit("cost", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Desconto (%)</label>
                      <input type="number" className="form-input" value={editForm.discount}
                        onChange={e => upEdit("discount", e.target.value)} />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Tamanhos (vírgula)</label>
                      <input className="form-input" value={editForm.sizes}
                        onChange={e => upEdit("sizes", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cores (vírgula)</label>
                      <input className="form-input" value={editForm.colors}
                        onChange={e => upEdit("colors", e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descrição</label>
                    <textarea className="form-input" rows={3} value={editForm.description}
                      onChange={e => upEdit("description", e.target.value)}
                      style={{ resize: "vertical" }} />
                  </div>

                  <div className={styles.checkRow}>
                    <label className={styles.toggleRow}>
                      <input type="checkbox" checked={editForm.is_new}
                        onChange={e => upEdit("is_new", e.target.checked)} />
                      <span className={styles.toggleLabel}>Marcar como NOVO</span>
                    </label>
                    <label className={styles.toggleRow}>
                      <input type="checkbox" checked={editForm.is_best_seller}
                        onChange={e => upEdit("is_best_seller", e.target.checked)} />
                      <span className={styles.toggleLabel}>Mais vendido</span>
                    </label>
                    <label className={styles.toggleRow}>
                      <input type="checkbox" checked={editForm.is_active}
                        onChange={e => upEdit("is_active", e.target.checked)} />
                      <span className={styles.toggleLabel}>Produto ativo (visível)</span>
                    </label>
                  </div>

                  {editForm.price && editForm.cost && (
                    <div className={styles.marginPreview}>
                      <span>💰 Margem:</span>
                      <strong>
                        {((Number(editForm.price) - Number(editForm.cost)) / Number(editForm.price) * 100).toFixed(1)}%
                      </strong>
                      <span>— Lucro: R$ {(Number(editForm.price) - Number(editForm.cost)).toFixed(2).replace(".", ",")}/peça</span>
                    </div>
                  )}

                  <div className={styles.formActions}>
                    <button type="submit" className="btn-primary" disabled={editUploading}>
                      <Check size={16} />
                      {editUploading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
                    </button>
                    <button type="button" className="btn-outline"
                      onClick={() => setActiveTab("produtos")}>
                      CANCELAR
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── NOVO PRODUTO ── */}
            {activeTab === "novo" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>NOVO PRODUTO</h2>
                <form className={styles.form} onSubmit={handleSaveProduct}>

                  <div className={styles.uploadArea}>
                    <p className={styles.fieldLabel}>FOTOS DO PRODUTO (máx. 4) *</p>
                    <div className={styles.previewGrid}>
                      {previews.map((url, i) => (
                        <div key={i} className={styles.previewItem}>
                          <img src={url} alt={`preview ${i}`} />
                          <button type="button" className={styles.removeImg}
                            onClick={() => removeImage(i)}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {previews.length < 4 && (
                        <button type="button" className={styles.uploadBtn}
                          onClick={() => fileRef.current.click()}>
                          <Upload size={20} />
                          <span>ADICIONAR FOTO</span>
                        </button>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" multiple
                      style={{ display: "none" }}
                      onChange={e => handleImageSelect(e, false)} />
                  </div>

                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Nome *</label>
                      <input className="form-input" placeholder="EX: CAMISETA IEZOUS OVERSIZE"
                        value={newProduct.name}
                        onChange={e => upNew("name", e.target.value.toUpperCase())} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tag</label>
                      <input className="form-input" placeholder="DROP 01, OFERTA..."
                        value={newProduct.tag}
                        onChange={e => upNew("tag", e.target.value.toUpperCase())} />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Linha</label>
                      <select className="form-input" value={newProduct.line}
                        onChange={e => upNew("line", e.target.value)} style={{ cursor: "pointer" }}>
                        <option>Linha Streetwear</option>
                        <option>Linha Cristã</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Categoria</label>
                      <select className="form-input" value={newProduct.category}
                        onChange={e => upNew("category", e.target.value)} style={{ cursor: "pointer" }}>
                        <option value="streetwear">Streetwear</option>
                        <option value="cristã">Cristã</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Gênero</label>
                      <select className="form-input" value={newProduct.gender}
                        onChange={e => upNew("gender", e.target.value)} style={{ cursor: "pointer" }}>
                        <option value="unissex">Unissex</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estoque *</label>
                      <input type="number" className="form-input" placeholder="60"
                        value={newProduct.stock}
                        onChange={e => upNew("stock", e.target.value)} required />
                    </div>
                  </div>

                  <div className={styles.row3}>
                    <div className="form-group">
                      <label className="form-label">Preço de venda (R$) *</label>
                      <input type="number" step="0.01" className="form-input" placeholder="69,90"
                        value={newProduct.price}
                        onChange={e => upNew("price", e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Custo (R$)</label>
                      <input type="number" step="0.01" className="form-input" placehlder="89,00"
                        value={newProduct.cost}
                        onChange={e => upNew("cost", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Desconto (%)</label>
                      <input type="number" className="form-input" placeholder="0"
                        value={newProduct.discount}
                        onChange={e => upNew("discount", e.target.value)} />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Tamanhos (separados por vírgula)</label>
                      <input className="form-input" placeholder="P,M,G,GG,XGG"
                        value={newProduct.sizes}
                        onChange={e => upNew("sizes", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cores (separadas por vírgula)</label>
                      <input className="form-input" placeholder="Preto,Off-White"
                        value={newProduct.colors}
                        onChange={e => upNew("colors", e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descrição</label>
                    <textarea className="form-input" rows={3}
                      placeholder="Descreva o produto, tecido, caimento..."
                      value={newProduct.description}
                      onChange={e => upNew("description", e.target.value)}
                      style={{ resize: "vertical" }} />
                  </div>

                  <div className={styles.checkRow}>
                    <label className={styles.toggleRow}>
                      <input type="checkbox" checked={newProduct.is_new}
                        onChange={e => upNew("is_new", e.target.checked)} />
                      <span className={styles.toggleLabel}>Marcar como NOVO</span>
                    </label>
                    <label className={styles.toggleRow}>
                      <input type="checkbox" checked={newProduct.is_best_seller}
                        onChange={e => upNew("is_best_seller", e.target.checked)} />
                      <span className={styles.toggleLabel}>Mais vendido</span>
                    </label>
                  </div>

                  {newProduct.price && newProduct.cost && (
                    <div className={styles.marginPreview}>
                      <span>💰 Margem:</span>
                      <strong>
                        {((Number(newProduct.price) - Number(newProduct.cost)) / Number(newProduct.price) * 100).toFixed(1)}%
                      </strong>
                      <span>— Lucro: R$ {(Number(newProduct.price) - Number(newProduct.cost)).toFixed(2).replace(".", ",")}/peça</span>
                    </div>
                  )}

                  {saveStatus === "success" && (
                    <div className={styles.statusSuccess}>
                      <Check size={20} />
                      <div>
                        <p className={styles.statusTitle}>PRODUTO ADICIONADO!</p>
                        <p className={styles.statusSub}>Redirecionando para a lista de produtos...</p>
                      </div>
                    </div>
                  )}

                  {saveStatus === "error" && (
                    <div className={styles.statusError}>
                      <X size={20} />
                      <div>
                        <p className={styles.statusTitle}>ERRO AO SALVAR</p>
                        <p className={styles.statusSub}>Verifique os campos e tente novamente.</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`${styles.submitBtn} ${saveStatus === "saving" ? styles.saving : ""} ${saveStatus === "success" ? styles.success : ""}`}
                    disabled={saveStatus === "saving" || saveStatus === "success"}
                  >
                    {saveStatus === "idle" && <><PlusCircle size={16} /> ADICIONAR PRODUTO</>}
                    {saveStatus === "saving" && <><span className={styles.spinner} /> SALVANDO PRODUTO...</>}
                    {saveStatus === "success" && <><Check size={16} /> PRODUTO SALVO!</>}
                    {saveStatus === "error" && <><PlusCircle size={16} /> TENTAR NOVAMENTE</>}
                  </button>

                </form>
              </div>
            )}

            {/* ── LANÇAMENTOS ── */}
            {activeTab === "lancamentos" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>AGENDAR LANÇAMENTO</h2>
                <p className={styles.panelSub}>
                  O produto ficará marcado como novo e com data de lançamento definida.
                </p>
                <form className={styles.form} onSubmit={handleSaveLaunch}>
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
                      <label className="form-label">Data *</label>
                      <input type="date" className="form-input" value={launchDate.date}
                        onChange={e => setLaunchDate(l => ({ ...l, date: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Horário *</label>
                      <input type="time" className="form-input" value={launchDate.time}
                        onChange={e => setLaunchDate(l => ({ ...l, time: e.target.value }))} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    <Calendar size={16} /> AGENDAR
                  </button>
                </form>
              </div>
            )}

            {/* ── ANÚNCIOS ── */}
            {activeTab === "anuncios" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>CRIAR ANÚNCIO</h2>
                <p className={styles.panelSub}>
                  Aparece na barra do topo do site para todos os visitantes.
                </p>
                <form className={styles.form} onSubmit={handleSaveAnnouncement}>
                  <div className="form-group">
                    <label className="form-label">Título *</label>
                    <input className="form-input" placeholder="DROP 01 — DISPONÍVEL AGORA"
                      value={announcement.title}
                      onChange={e => upAnn("title", e.target.value.toUpperCase())} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Texto da barra *</label>
                    <textarea className="form-input" rows={2}
                      placeholder="🚀 DROP 01 — APENAS 60 PEÇAS — FRETE GRÁTIS ACIMA DE R$ 199,90"
                      value={announcement.text}
                      onChange={e => upAnn("text", e.target.value)}
                      style={{ resize: "vertical" }} required />
                  </div>
                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Data de início</label>
                      <input type="date" className="form-input" value={announcement.start}
                        onChange={e => upAnn("start", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Data de fim</label>
                      <input type="date" className="form-input" value={announcement.end}
                        onChange={e => upAnn("end", e.target.value)} />
                    </div>
                  </div>
                  <label className={styles.toggleRow}>
                    <input type="checkbox" checked={announcement.active}
                      onChange={e => upAnn("active", e.target.checked)} />
                    <span className={styles.toggleLabel}>Ativar imediatamente</span>
                  </label>
                  {announcement.text && (
                    <div className={styles.preview}>
                      <span className={styles.fieldLabel}>PRÉ-VISUALIZAÇÃO:</span>
                      <div className={styles.previewBar}>{announcement.text}</div>
                    </div>
                  )}
                  <button type="submit" className="btn-primary">
                    <Megaphone size={16} /> PUBLICAR ANÚNCIO
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}