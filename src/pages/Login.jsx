import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import styles from "./Login.module.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(form.email, form.password);
    setLoading(false);
    if (ok) navigate(redirect);
    else setError("E-mail ou senha incorretos.");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.sigma}>Σ</span>IGMA
        </div>
        <h1 className={styles.title}>ENTRAR</h1>
        <p className={styles.sub}>Acesse sua conta e acompanhe seus pedidos.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPwd ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd(s => !s)}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OU</span>
        </div>

        <p className={styles.register}>
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className={styles.registerLink}>
            CRIAR CONTA
          </Link>
        </p>
      </div>
    </div>
  );
}
