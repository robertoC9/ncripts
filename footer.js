/* ------------------------------
   FOOTER – Hora, región, idioma, IP, sistema
---------------------------------*/

function updateFooterTime() {
    const el = document.getElementById("footerTime");
    if (!el) return;

    const now = new Date();
    const formatted = now.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "medium"
    });

    el.textContent = `Hora local: ${formatted}`;
}

function updateFooterRegion() {
    const el = document.getElementById("footerRegion");
    if (!el) return;

    const region = Intl.DateTimeFormat().resolvedOptions().timeZone;
    el.textContent = `Región detectada: ${region}`;
}

function updateFooterLang() {
    const el = document.getElementById("footerLang");
    if (!el) return;

    const lang = navigator.language || navigator.userLanguage;
    el.textContent = `Idioma del navegador: ${lang}`;
}

async function updateFooterIP() {
    const el = document.getElementById("footerIP");
    if (!el) return;

    try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        el.textContent = `IP pública: ${data.ip}`;
    } catch {
        el.textContent = "IP pública: No disponible";
    }
}

function updateFooterSystem() {
    const el = document.getElementById("footerSystem");
    if (!el) return;

    const browser = navigator.userAgent;
    const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "N/D";

    el.textContent = `Sistema: ${browser} | RAM aprox: ${memory}`;
}

/* Actualización en tiempo real */
setInterval(updateFooterTime, 1000);

/* Ejecutar al cargar */
updateFooterTime();
updateFooterRegion();
updateFooterLang();
updateFooterIP();
updateFooterSystem();
