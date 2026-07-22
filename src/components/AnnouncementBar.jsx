import { useState } from "react";
import { X } from "lucide-react";
import styles from "./AnnouncementBar.module.css";

const messages = [
  " FRETE GRÁTIS acima de R$ 199,90",
  " DROP 02 DISPONÍVEL — CONFIRA AS NOVIDADES",
  " PIX COM DESCONTO EXTRA — PARCELE EM ATÉ 12X SEM JUROS NO CARTÃO",
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);

  if (!visible) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <span className={styles.msg}>{messages[idx]}</span>
        <div className={styles.dots}>
          {messages.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === idx ? styles.active : ""}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>
      <button className={styles.close} onClick={() => setVisible(false)}>
        <X size={14} />
      </button>
    </div>
  );
}
