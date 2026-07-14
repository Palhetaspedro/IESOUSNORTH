import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Login.module.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
    phone: "", address: "", city: "", state: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const up = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("As senhas não conferem.");
      return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    register({ name: form.name, email: form.email, phone: form.phone, address: form.address });
    navigate("/");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 500 }}>
        <div className={styles.brand}>
          <span className={styles.sigma}>Σ</span>IGMA
        </div>
        <h1 className={styles.title}>CRIAR CONTA</h1>
        <p className={styles.sub}>Bem-vindo à família. Crie sua conta abaixo.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Nome completo *</label>
            <input className="form-input" placeholder="Seu nome" value={form.name}
              onChange={e => up("name", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">E-mail *</label>
            <input type="email" className="form-input" placeholder="seu@email.com"
              value={form.email} onChange={e => up("email", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input className="form-input" placeholder="(00) 00000-0000"
              value={form.phone} onChange={e => up("phone", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Senha *</label>
            <input type="password" className="form-input" placeholder="Mínimo 6 caracteres"
              value={form.password} onChange={e => up("password", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar senha *</label>
            <input type="password" className="form-input" placeholder="Repita a senha"
              value={form.confirm} onChange={e => up("confirm", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Endereço</label>
            <input className="form-input" placeholder="Rua, número, bairro"
              value={form.address} onChange={e => up("address", e.target.value)} />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "CRIANDO CONTA..." : "CRIAR CONTA"}
          </button>
        </form>

        <div className={styles.divider}><span>JÁ TEM CONTA?</span></div>

        <p className={styles.register}>
          <Link to="/login" className={styles.registerLink}>FAZER LOGIN</Link>
        </p>
      </div>
    </div>
  );
}
