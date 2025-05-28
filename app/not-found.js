"use client";

import { useRouter } from "next/navigation";
import styles from "./not-found.module.css";

export default function NotFound() {
  const router = useRouter();

  const goToMap = () => {
    router.push("/map");
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Sayfa Bulunamadı</h1>
        <p className={styles.description}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>

        <button className={styles.mapButton} onClick={goToMap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Haritaya Git
        </button>
      </div>
    </div>
  );
}
