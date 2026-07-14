import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { banners } from "../data/products";
import styles from "./Banner.module.css";

export default function Banner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent(c => (c + 1) % banners.length);
  const b = banners[current];

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.slide}
        style={{ backgroundImage: `url(${b.bg})` }}
      >
        <div className={styles.overlay} />
        <div className={styles.content}>
          <span className={styles.tag}>{b.tag}</span>
          <h1 className={styles.headline}>{b.headline}</h1>
          <p className={styles.subline}>{b.subline}</p>
          <div className={styles.ctas}>
            <Link to="/catalogo" className="btn-primary">{b.cta}</Link>
          </div>
          <div className={styles.badge}>{b.badge}</div>
        </div>
      </div>

      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev}>
        <ChevronLeft size={20} />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next}>
        <ChevronRight size={20} />
      </button>

      <div className={styles.dots}>
        {banners.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.active : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
