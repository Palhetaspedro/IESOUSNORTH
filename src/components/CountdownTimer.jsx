import { useState, useEffect } from "react";
import styles from "./CountdownTimer.module.css";

function pad(n) { return String(n).padStart(2, "0"); }

export default function CountdownTimer({ hours = 6, label = "Ofertas do dia" }) {
  const [time, setTime] = useState({ h: hours, m: 0, s: 0 });

  useEffect(() => {
    const target = Date.now() + hours * 3600 * 1000;
    const t = setInterval(() => {
      const diff = Math.max(0, target - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
      if (diff === 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <span className={styles.icon}>⏱</span>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.right}>
        <span className={styles.hint}>Termina em:</span>
        <div className={styles.timer}>
          <div className={styles.block}>
            <span className={styles.num}>{pad(time.h)}</span>
            <span className={styles.unit}>h</span>
          </div>
          <span className={styles.sep}>:</span>
          <div className={styles.block}>
            <span className={styles.num}>{pad(time.m)}</span>
            <span className={styles.unit}>m</span>
          </div>
          <span className={styles.sep}>:</span>
          <div className={styles.block}>
            <span className={styles.num}>{pad(time.s)}</span>
            <span className={styles.unit}>s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
