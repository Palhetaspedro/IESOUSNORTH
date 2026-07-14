import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.brand}>
              <div className={styles.logo}>
                <span className={styles.sigma}>I</span>ΣSOUS NØRTH
              </div>
              <p className={styles.tagline}>
                Streetwear que fala mais<br />do que palavras.
              </p>
              <div className={styles.socials}>
                <a href="#" className={styles.social} title="Instagram"><ExternalLink size={16} /></a>
                <a href="#" className={styles.social} title="X / Twitter"><ExternalLink size={16} /></a>
              </div>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>LOJA</h4>
              <Link to="/catalogo" className={styles.link}>Todos os Produtos</Link>
              <Link to="/catalogo?categoria=novidades" className={styles.link}>Novidades</Link>
              <Link to="/catalogo?categoria=ofertas" className={styles.link}>Ofertas</Link>
              <Link to="/catalogo?categoria=cristã" className={styles.link}>Linha Cristã</Link>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>AJUDA</h4>
              <Link to="/sobre" className={styles.link}>Sobre nós</Link>
              <Link to="/frete" className={styles.link}>Prazo de Entrega</Link>
              <Link to="/trocas" className={styles.link}>Trocas e Devoluções</Link>
              <Link to="/contato" className={styles.link}>Contato</Link>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>PAGAMENTO</h4>
              <div className={styles.payments}>
                {["PIX", "VISA", "MASTER", "ELO"].map(p => (
                  <span key={p} className={styles.payBadge}>{p}</span>
                ))}
              </div>
              <p className={styles.secure}>
                Ambiente 100% seguro.<br />
                Dados protegidos pela LGPD.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span>© 2026 IΣSOUS NØRTH — Todos os direitos reservados.</span>
          <div className={styles.bottomLinks}>
            <Link to="/privacidade" className={styles.bottomLink}>Privacidade</Link>
            <Link to="/termos" className={styles.bottomLink}>Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
