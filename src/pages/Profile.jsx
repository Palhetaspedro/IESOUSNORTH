import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Phone, Lock, LogOut, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import styles from "./Profile.module.css";

const tabs = [
  { id: "dados", label: "MEUS DADOS", icon: User },
  { id: "pedidos", label: "PEDIDOS", icon: Package },
  { id: "endereco", label: "ENDEREÇO", icon: MapPin },
  { id: "senha", label: "SENHA", icon: Lock },
];

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dados");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    currentPwd: "",
    newPwd: "",
    confirmPwd: "",
  });

  const [pwdError, setPwdError] = useState("");

  const up = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name: form.name, phone: form.phone, address: form.address, city: form.city, state: form.state });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePwd = (e) => {
    e.preventDefault();
    setPwdError("");
    if (!form.currentPwd) { setPwdError("Informe a senha atual."); return; }
    if (form.newPwd.length < 6) { setPwdError("Nova senha precisa ter pelo menos 6 caracteres."); return; }
    if (form.newPwd !== form.confirmPwd) { setPwdError("As novas senhas não conferem."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setForm(f => ({ ...f, currentPwd: "", newPwd: "", confirmPwd: "" }));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userCard}>
              <div className={styles.avatar}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className={styles.userName}>{user.name || "Usuário"}</p>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
            </div>

            <nav className={styles.nav}>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`${styles.navBtn} ${activeTab === tab.id ? styles.activeNav : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <LogOut size={15} />
                SAIR
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className={styles.content}>
            {/* Dados Pessoais */}
            {activeTab === "dados" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>MEUS DADOS</h2>
                <form onSubmit={handleSave} className={styles.form}>
                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Nome completo</label>
                      <input className="form-input" value={form.name}
                        onChange={e => up("name", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">E-mail</label>
                      <input className="form-input" value={form.email} disabled
                        style={{ opacity: 0.5, cursor: "not-allowed" }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <input className="form-input" placeholder="(00) 00000-0000"
                      value={form.phone} onChange={e => up("phone", e.target.value)} />
                  </div>
                  <div className={styles.saveRow}>
                    <button type="submit" className="btn-primary">
                      {saved ? "SALVO!" : "SALVAR ALTERAÇÕES"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Endereço */}
            {activeTab === "endereco" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>ENDEREÇO DE ENTREGA</h2>
                <form onSubmit={handleSave} className={styles.form}>
                  <div className="form-group">
                    <label className="form-label">Endereço completo</label>
                    <input className="form-input" placeholder="Rua, número, bairro"
                      value={form.address} onChange={e => up("address", e.target.value)} />
                  </div>
                  <div className={styles.row2}>
                    <div className="form-group">
                      <label className="form-label">Cidade</label>
                      <input className="form-input" placeholder="Sua cidade"
                        value={form.city} onChange={e => up("city", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estado</label>
                      <input className="form-input" placeholder="UF"
                        value={form.state} onChange={e => up("state", e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.saveRow}>
                    <button type="submit" className="btn-primary">
                      {saved ? "SALVO!" : "SALVAR ENDEREÇO"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Pedidos */}
            {activeTab === "pedidos" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>MEUS PEDIDOS</h2>
                <div className={styles.emptyOrders}>
                  <Package size={48} strokeWidth={1} style={{ color: "var(--border)" }} />
                  <p>Você ainda não fez nenhum pedido.</p>
                  <a href="/catalogo" className="btn-outline">EXPLORAR CATÁLOGO</a>
                </div>
              </div>
            )}

            {/* Senha */}
            {activeTab === "senha" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>ALTERAR SENHA</h2>
                <form onSubmit={handlePwd} className={styles.form}>
                  <div className="form-group">
                    <label className="form-label">Senha atual</label>
                    <input type="password" className="form-input" value={form.currentPwd}
                      onChange={e => up("currentPwd", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nova senha</label>
                    <input type="password" className="form-input" placeholder="Mín. 6 caracteres"
                      value={form.newPwd} onChange={e => up("newPwd", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmar nova senha</label>
                    <input type="password" className="form-input"
                      value={form.confirmPwd} onChange={e => up("confirmPwd", e.target.value)} />
                  </div>
                  {pwdError && <p className={styles.error}>{pwdError}</p>}
                  {saved && <p className={styles.success}>Senha alterada com sucesso!</p>}
                  <div className={styles.saveRow}>
                    <button type="submit" className="btn-primary">ALTERAR SENHA</button>
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
