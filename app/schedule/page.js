"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Schedule() {
  const router = useRouter();

  const goBack = () => {
    router.push("/map");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={goBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className={styles.title}>Shuttle Saatleri</h1>
        <div className={styles.spacer}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <img
            src="/shuttle-saatleri.jpeg"
            alt="Shuttle Saatleri"
            className={styles.scheduleImage}
          />
        </div>
      </div>
    </div>
  );
}
