import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Heart, Menu, X, LayoutDashboard } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { navLinks } from "../data/products";
import styles from "./Header.module.css";

export default function Header() {
  const { totalItems } = useCart();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const isAdmin = profile?.role === "admin";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  return (
    <>
      <header className={styles.header}>
        <button className={styles.menuBtn} onClick={() => setMenuOpen(true)}>
          <Menu size={20} />
        </button>

        <Link to="/" className={styles.logo}>
          <span className={styles.sigma}>IΣSOUS</span>
        </Link>

        <nav className={styles.nav}>
          {navLinks.map(link => (
            <Link key={link.label} to={link.path} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className={styles.adminLink}>
              <LayoutDashboard size={13} />
              ÁREA DO ADMIN
            </Link>
          )}
        </nav>

        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => setSearchOpen(true)}>
            <Search size={18} />
          </button>
          <Link to="/favoritos" className={styles.iconBtn}>
            <Heart size={18} />
          </Link>
          <Link to={user ? "/perfil" : "/login"} className={styles.iconBtn}>
            <User size={18} />
          </Link>
          <Link to="/carrinho" className={styles.cartBtn}>
            <ShoppingBag size={18} />
            {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
          </Link>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchInner}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <Search size={20} className={styles.searchIcon} />
              <input
                autoFocus
                type="text"
                placeholder="O que você procura hoje?"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className={styles.searchInput}
              />
              <button type="button" className={styles.searchClose} onClick={() => setSearchOpen(false)}>
                <X size={20} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className={styles.drawerOverlay} onClick={() => setMenuOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <span className={styles.drawerLogo}>
                <span className={styles.sigma}>Σ</span>IGMA
              </span>
              <button className={styles.iconBtn} onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className={styles.drawerNav}>
              {navLinks.map(link => (
                <Link key={link.label} to={link.path} className={styles.drawerLink}
                  onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <hr className="divider" style={{ margin: "16px 0" }} />
              {isAdmin && (
                <Link to="/admin" className={styles.drawerAdminLink}
                  onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={14} />
                  ÁREA DO ADMINISTRADOR
                </Link>
              )}
              {user ? (
                <>
                  <Link to="/perfil" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                    MEU PERFIL
                  </Link>
                  <button className={styles.drawerLogout}
                    onClick={() => { logout(); setMenuOpen(false); }}>
                    SAIR
                  </button>
                </>
              ) : (
                <Link to="/login" className={styles.drawerLink} onClick={() => setMenuOpen(false)}>
                  ENTRAR / CADASTRAR
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}