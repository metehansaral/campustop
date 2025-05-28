"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import dynamic from "next/dynamic";
import driversData from '../../drivers.json';

// MapView bileşeni sadece client-side'da yüklenecek
const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function Map() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [buses, setBuses] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [modalPosition, setModalPosition] = useState(0); // 0: aşağıda, 1: tam ekran
  const [isDriving, setIsDriving] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const startYRef = useRef(null);
  const lastPositionRef = useRef(0);
  const [driverNumber, setDriverNumber] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const minHeight = 15; // vh
  const maxHeight = 85; // vh
  const [errors, setErrors] = useState([]); // {id, message, touchStartY, dismissed}

  // Örnek hatlar
  const routes = [
    {
      id: 1,
      name: "MB1",
      departure: "Mahmutbey",
      stops: ["Yenibosna", "Kadir Has"],
      arrival: "Bakırköy"
    },
    {
      id: 2,
      name: "MB2",
      departure: "Bakırköy",
      stops: ["Kadir Has", "Yenibosna"],
      arrival: "Mahmutbey"
    },
    {
      id: 3,
      name: "MG1",
      departure: "Mahmutbey",
      stops: ["Mecidiyeköy"],
      arrival: "Gayrettepe"
    },
    {
      id: 4,
      name: "MG2",
      departure: "Gayrettepe",
      stops: ["Mecidiyeköy"],
      arrival: "Mahmutbey"
    },
    {
      id: 5,
      name: "MM",
      departure: "M. Metro",
      stops: ["M. Kampüs", "M. Kampüs"],
      arrival: "M. Metro"
    },
    {
      id: 6,
      name: "MY",
      departure: "M. Kampüs",
      stops: ["Yenibosna", "Yenibosna"],
      arrival: "M. Kampüs"
    },
        {
      id: 7,
      name: "MM",
      departure: "M. Metro",
      stops: ["M. Kampüs", "M. Kampüs"],
      arrival: "M. Metro"
    },
        {
      id: 8,
      name: "MY",
      departure: "M. Kampüs",
      stops: ["Yenibosna", "Yenibosna"],
      arrival: "M. Kampüs"
    }
  ];

  // Modal sürükleme fonksiyonları
  const handleTouchStart = (e) => {
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    if (!isDragging || startYRef.current === null) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    // Sadece yukarı sürüklemeyi dikkate al
    if (modalPosition === 0 && deltaY < 0) {
      setDragOffset(Math.max(deltaY, -window.innerHeight * (maxHeight - minHeight) / 100));
    } else if (modalPosition === 1 && deltaY > 0) {
      setDragOffset(Math.min(deltaY, window.innerHeight * (maxHeight - minHeight) / 100));
    }
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    if (modalPosition === 0) {
      // Yukarı doğru yeterince sürüklendiyse büyüt
      if (Math.abs(dragOffset) > window.innerHeight * 0.15) {
        setModalPosition(1);
      }
    } else {
      // Aşağı doğru yeterince sürüklendiyse küçült
      if (dragOffset > window.innerHeight * 0.15) {
        setModalPosition(0);
      }
    }
    setDragOffset(0);
    startYRef.current = null;
  };

  // Sürükleme sadece interaktif olmayan alanlarda başlasın
  const isInteractiveElement = (el) => {
    if (!el) return false;
    return (
      el.closest('button') ||
      el.closest('input') ||
      el.closest('select') ||
      el.closest('textarea') ||
      el.closest('a')
    );
  };

  const handleAnyTouchStart = (e) => {
    // Eğer tıklanan alan interaktifse sürükleme başlatma
    if (isInteractiveElement(e.target)) return;
    handleTouchStart(e);
  };

  function logout() {
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

    setTimeout(() => {
      router.push("/");
    }, 500);
  }

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

  // Otobüs verisi çek
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchBuses = async () => {
      try {
        const res = await fetch("/api/bus_location");
        const data = await res.json();
        if (data.success) setBuses(data.buses);
      } catch (error) {
        console.error("Otobüs verisi alınamadı:", error);
      }
    };

    fetchBuses();
    const interval = setInterval(fetchBuses, 2000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  // Kullanıcı konumunu al
  useEffect(() => {
    if (!isAuthorized) return;

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Konum alınamadı:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isAuthorized]);

  useEffect(() => {
    // Token'dan id'yi al
    const token = getCookie("token");
    if (token) {
      const [id] = token.split("-");
      setDriverNumber(id);
    }
  }, []);

  useEffect(() => {
    if (!isDriving || !selectedRoute || !driverNumber) return;

    let watchId;
    let lastSent = 0;

    const sendLocation = (position) => {
      const now = Date.now();
      if (now - lastSent < 2000) return;
      lastSent = now;

      const routeObj = routes.find(r => r.id === selectedRoute);
      const routeName = routeObj ? routeObj.name : null;
      if (!routeName) return;

      fetch("/api/driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: routeName,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          isActive: true,
          driverNumber: driverNumber,
          startedAt: new Date().toISOString(),
          stoppedAt: null
        })
      });
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        sendLocation,
        (error) => {
          console.error("Konum alınamadı:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isDriving, selectedRoute, driverNumber]);

  if (!isAuthorized) return null;

  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [41.015, 28.98]; // default merkez

  // Sürüşü başlat fonksiyonu
  const handleStartDriving = () => {
    if (!selectedRoute) {
      const id = Date.now() + Math.random();
      setErrors((prev) => [
        ...prev,
        { id, message: "Lütfen bir hat seçin!", touchStartY: null, dismissed: false }
      ]);
      setTimeout(() => {
        setErrors((prev) => prev.filter((err) => err.id !== id));
      }, 3000);
      return;
    }
    setIsDriving(true);
  };

  // Hata swipe (yukarı kaydırma) ile kapatma fonksiyonları
  const handleErrorTouchStart = (id, e) => {
    const touchY = e.touches[0].clientY;
    setErrors((prev) => prev.map(err => err.id === id ? { ...err, touchStartY: touchY } : err));
  };
  const handleErrorTouchMove = (id, e) => {
    const touchY = e.touches[0].clientY;
    setErrors((prev) => prev.map(err => {
      if (err.id === id && err.touchStartY !== null) {
        const deltaY = touchY - err.touchStartY;
        return { ...err, deltaY };
      }
      return err;
    }));
  };
  const handleErrorTouchEnd = (id, e) => {
    setErrors((prev) => prev.map(err => {
      if (err.id === id && err.deltaY < -30) {
        // Yeterince yukarı kaydırıldıysa kapat
        return { ...err, dismissed: true };
      }
      return { ...err, deltaY: 0 };
    }));
    setTimeout(() => {
      setErrors((prev) => prev.filter((err) => err.id !== id));
    }, 300);
  };

  // Sürücü adı bulma
  const driverName = driverNumber
    ? (driversData.drivers.find(d => String(d.driver_number) === String(driverNumber))?.name || "")
    : "";

  const handleStopDriving = async () => {
    if (!selectedRoute || !driverNumber) {
      setIsDriving(false);
      return;
    }
    const routeObj = routes.find(r => r.id === selectedRoute);
    const routeName = routeObj ? routeObj.name : null;
    await fetch("/api/driver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routeId: routeName,
        location: userLocation,
        isActive: false,
        driverNumber: driverNumber,
        startedAt: null,
        stoppedAt: new Date().toISOString()
      })
    });
    setIsDriving(false);
  };

  return (
    <div className={styles.map_container}>
      {/* Saatler butonu - sağ üstte */}
      <div className={styles.scheduleButtonContainer}>
        <button
          className={styles.scheduleButton}
          onClick={() => router.push('/schedule')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Saatler</span>
        </button>
      </div>

      {/* Stack'li, animasyonlu hata mesajları */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        {errors.map((err, idx) => (
          <div
            key={err.id}
            onTouchStart={e => handleErrorTouchStart(err.id, e)}
            onTouchMove={e => handleErrorTouchMove(err.id, e)}
            onTouchEnd={e => handleErrorTouchEnd(err.id, e)}
            style={{
              pointerEvents: 'auto',
              width: 'calc(100% - 32px)',
              maxWidth: 600,
              margin: idx === 0 ? '18px auto 0 auto' : '8px auto 0 auto',
              background: 'rgba(255,255,255,0.45)',
              color: '#222',
              padding: '15px 28px',
              borderRadius: '18px',
              fontSize: '1.08rem',
              fontWeight: 500,
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              boxSizing: 'border-box',
              position: 'relative',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.35)',
              transform: `translateY(${err.dismissed ? '-120%' : (err.deltaY || 0)}px) scale(${err.dismissed ? 0.98 : 1})`,
              opacity: err.dismissed ? 0 : 1,
              transition: 'transform 0.38s cubic-bezier(.4,1.2,.6,1), opacity 0.38s cubic-bezier(.4,1.2,.6,1)',
              userSelect: 'none',
              touchAction: 'pan-y',
              cursor: 'grab',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight:6}}><circle cx="12" cy="12" r="12" fill="#ff4d4d33"/><path d="M12 7v4m0 4h.01" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round"/></svg>
              <span>{err.message}</span>
            </div>
          </div>
        ))}
      </div>
      <MapView center={center} buses={buses} userLocation={userLocation} showUserPin={!isDriving} />
      {/* Sadece driver için modal */}
      {showModal && (
        <>
          {/* Tam ekran modda arka planı kapatıcı overlay */}
          {modalPosition === 1 && <div className={styles.overlay}></div>}
          <div
            className={styles.modal}
            onTouchStart={handleAnyTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              height: `calc(${modalPosition === 1 ? maxHeight : minHeight}vh + ${dragOffset}px)` ,
              minHeight: `${minHeight}vh`,
              maxHeight: `${maxHeight}vh`,
              bottom: 0,
              transition: isDragging ? 'none' : 'height 0.4s cubic-bezier(.4,1.2,.6,1)',
              boxShadow: modalPosition === 1 ? "0 0 0 100vmax rgba(0,0,0,0.10)" : undefined,
              touchAction: 'none',
            }}
          >
            <div className={styles.modalHandle}></div>
            {/* Şoför profil bilgisi */}
            {driverNumber && (
              <div className={styles.driverProfile}>
                <div className={styles.driverAvatar}>{driverNumber[0]}</div>
                <div>
                  <div className={styles.driverName}>{driverName}</div>
                  <div className={styles.driverCode} style={{fontSize:'0.95em',opacity:0.7}}>{driverNumber}</div>
                </div>
              </div>
            )}
            <div className={styles.modalHeader}>
              <button
                className={styles.startBtn}
                onClick={handleStartDriving}
                disabled={isDriving}
              >Sürüşü Başlat</button>
              <button
                className={styles.stopBtn}
                onClick={handleStopDriving}
                disabled={!isDriving}
              >Durdur</button>
            </div>
            <div className={styles.routeList}>
              <h4>Hat Seçimi</h4>
              {routes.map((route) => (
                <div
                  key={route.id}
                  className={selectedRoute === route.id ? styles.selectedRoute : styles.route}
                  onClick={() => {
                    if (isDriving) {
                      const id = Date.now() + Math.random();
                      setErrors((prev) => [
                        ...prev,
                        { id, message: "Sürüş sırasında hat değiştirilemez!", touchStartY: null, dismissed: false }
                      ]);
                      setTimeout(() => {
                        setErrors((prev) => prev.filter((err) => err.id !== id));
                      }, 3000);
                      return;
                    }
                    if (selectedRoute === route.id) {
                      setSelectedRoute(null);
                    } else {
                      setSelectedRoute(route.id);
                    }
                  }}
                >
                  <span className={styles.routeName}>{route.name}</span>
                  <span className={styles.routePath}>
                    {route.departure} → {route.stops.join(", ")} → {route.arrival}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}
