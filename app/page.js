"use client"

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { RotatingLines } from "react-loader-spinner";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [showLoader, setShowLoader] = useState(false)

  function login() {
    if (email.length === 0) {
      return alert("Öğrenci numarası boş bırakılamaz")
    } else if (password.length === 0) {
      return alert("Lütfen şifrenizi girin")
    }

    setShowLoader(true);

    axios.post("/api/account", { number: email, password: password })
      .then((response) => {
        const data = response.data;

        if (data.success) {
          document.cookie = "token=" + data.driver.driver_number + "-" + data.driver.password + "; path=/; max-age=86400";

          setTimeout(() => {
            router.push("/map");
          }, 500)
        } else {
          setShowLoader(false);
          return alert("Girilen bilgiler hatalı")
        }
      }).catch(() => {
        setShowLoader(false);
        return alert("Girilen bilgiler hatalı")
      });

    // 210 502 115
    // 45 78
  }

  useEffect(() => {
    const token = getCookie("token");

    if (token) {
      router.push("/map");
    }
  }, []);

  return (
    <div className={styles.page}>
      {showLoader && <div className={styles.loader_container}>
        <RotatingLines
          height="46"
          width="46"
          strokeColor="white"
          strokeWidth="5"
          animationDuration="0.75"
        />
      </div>}

      <div className={styles.login_container}>
        <img src={"./altinbas.png"} className={styles.login_image} />

        <div className={styles.login_text}>
          <span>Altınbaş Üniversitesi</span>
          <span>Shuttle Takip Sistemi</span>
        </div>

        <div className={styles.login_form}>
          <div className={styles.login_input}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Öğrenci Numarası" type="number" pattern="[0-9]*" inputMode="numeric" />
          </div>
          <div className={styles.login_input}>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parola" type="password" />
          </div>
          <div className={styles.login_button} onClick={login}>
            <button data-active={email.length !== 0 && password.length !== 0}>Giriş Yap</button>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <span>ASO &copy;</span>
      </div>
    </div>
  );
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}
