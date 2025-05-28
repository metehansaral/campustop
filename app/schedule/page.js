"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Schedule() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Token kontrolü
  useEffect(() => {
    const checkToken = async () => {
      const token = getCookie("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await fetch("/api/check_token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!data.success) {
          router.push("/");
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Token kontrolü hatası:", error);
        router.push("/");
      }
    };

    checkToken();
  }, [router]);

  const goBack = () => {
    router.push("/map");
  };

  if (!isAuthorized) {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

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

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}
