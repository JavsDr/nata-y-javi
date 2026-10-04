/* =========================================================
   CONFIGURACIÓN — edita aquí lo que falta 👇
   ========================================================= */
const CONFIG = {
  // Fecha y hora (hora de Chile en diciembre = UTC-3)
  inicio: "2026-12-05T17:00:00-03:00",
  fin: "2026-12-06T03:00:00-03:00",

  // Lugar (si lo dejas vacío, se muestra "por confirmar")
  lugar: "El Tranque 174",
  direccion: "Chicureo, Colina",

  // WhatsApp que recibe las confirmaciones (formato internacional, sin + ni espacios)
  whatsapp: "56900000000",

  // Datos de transferencia
  banco: [
    ["Nombre", "Por completar"],
    ["RUT", "Por completar"],
    ["Banco", "Por completar"],
    ["Cuenta", "Por completar"],
    ["Mail", "Por completar"],
  ],

  // Regalos (precios en CLP)
  regalos: [
    { ico: "🛖", t: "Noche de cabaña con tinaja", d: "Para descansar después de tanto bailoteo.", p: 120000 },
    { ico: "🥾", t: "Trekking con guía", d: "Otro cerro más para la colección de selfies.", p: 60000 },
    { ico: "🍷", t: "Cena romántica (sin niñas)", d: "Una noche de conversación sin interrupciones. Una.", p: 70000 },
    { ico: "🛶", t: "Kayak al atardecer", d: "Prometemos no darnos vuelta. Mucho.", p: 50000 },
    { ico: "⛽", t: "Bencina para el road trip", d: "Kilómetros de playlist y paisajes.", p: 40000 },
    { ico: "☕", t: "Desayuno en la cama", d: "Con jugo natural y cero alarmas.", p: 25000 },
    { ico: "🍦", t: "Helados para las niñas", d: "Soborno oficial para que entren bien con los anillos.", p: 10000 },
    { ico: "💌", t: "Aporte libre", d: "Tú eliges el monto.", p: 0, libre: true },
  ],
};

/* Fotos: archivo + texto de la polaroid */
const FOTOS = [
  ["f13.jpg", "Cumbre conquistada"],
  ["f09.jpg", "Llueve, pero igual sonreímos"],
  ["f11.jpg", "Ese árbol era GIGANTE"],
  ["f12.jpg", "Agua, cerros y nosotros"],
  ["f16.jpg", "💍 ¡Sí!"],
  ["f02.jpg", "Recorriendo el mundo"],
  ["f15.jpg", "El equipo completo 😛"],
  ["f07.jpg", "Familia en flor"],
  ["f01.jpg", "Pide un deseo"],
  ["f06.jpg", "Modo elegante"],
  ["f17.jpg", "Domingo perfecto"],
  ["f10.jpg", "Bosque y neblina"],
];
const MEMORICE = ["f02.jpg", "f03.jpg", "f04.jpg", "f08.jpg", "f10.jpg", "f12.jpg", "f14.jpg", "f17.jpg"];

/* ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const clp = n => "$" + Math.round(n).toLocaleString("es-CL");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2800);
}

function party(opts = {}) {
  if (!window.confetti || reduced) return;
  const colors = ["#b98bd0", "#d8b8e8", "#efe2f5", "#8fa07a", "#b8327e", "#ffffff"];
  confetti({ particleCount: 120, spread: 80, origin: { y: .7 }, colors, ...opts });
}

/* ---------- pétalos ---------- */
function fallingPetals(container, n = 18) {
  if (reduced) return () => {};
  let alive = true;
  const spawn = () => {
    if (!alive) return;
    const p = document.createElement("span");
    p.className = "petal";
    const x = Math.random() * innerWidth, dur = 6 + Math.random() * 6, drift = (Math.random() - .5) * 240, s = .6 + Math.random() * .8;
    p.style.left = x + "px";
    p.style.transform = `scale(${s})`;
    container.appendChild(p);
    p.animate([
      { transform: `translate(0,0) rotate(0) scale(${s})` },
      { transform: `translate(${drift}px, ${innerHeight + 60}px) rotate(${Math.random() * 720 - 360}deg) scale(${s})` },
    ], { duration: dur * 1000, easing: "linear" }).onfinish = () => p.remove();
    setTimeout(spawn, 6000 / n + Math.random() * 300);
  };
  spawn();
  return () => { alive = false; };
}

function burst(x, y, n = 10) {
  if (reduced) return;
  for (let i = 0; i < n; i++) {
    const b = document.createElement("span");
    b.className = "burst";
    b.style.left = x + "px"; b.style.top = y + "px";
    document.body.appendChild(b);
    const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 60;
    b.animate([
      { transform: "translate(-50%,-50%) scale(1) rotate(0)", opacity: 1 },
      { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 30}px) scale(.4) rotate(${Math.random() * 360}deg)`, opacity: 0 },
    ], { duration: 800 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => b.remove();
  }
}

/* ---------- clave: las fotos están cifradas (AES-CBC + PBKDF2) ---------- */
const URLS = {};
const photo = src => URLS[src.replace(/\.\w+$/, "")] || "";
const normPw = p => p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
const hex = h => new Uint8Array(h.match(/../g).map(b => parseInt(b, 16)));

async function deriveKey(pw) {
  const sec = await (await fetch("secure.json")).json();
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normPw(pw)), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: hex(sec.salt), iterations: sec.iter, hash: "SHA-256" },
    base, { name: "AES-CBC", length: 256 }, false, ["decrypt"]);
}
async function decryptFile(key, path) {
  const buf = await (await fetch(path)).arrayBuffer();
  return crypto.subtle.decrypt({ name: "AES-CBC", iv: buf.slice(0, 16) }, key, buf.slice(16));
}
async function unlock(pw) {
  const key = await deriveKey(pw);
  let ok = false;
  try { ok = new TextDecoder().decode(await decryptFile(key, "img/check.bin")) === "nata&javi"; } catch {}
  if (!ok) return false;
  const names = [...new Set([...FOTOS.map(f => f[0]), ...MEMORICE])].map(f => f.replace(/\.\w+$/, ""));
  await Promise.all(names.map(async n => {
    URLS[n] = URL.createObjectURL(new Blob([await decryptFile(key, `img/${n}.bin`)], { type: "image/jpeg" }));
  }));
  return true;
}

/* ---------- intro: el sobre ---------- */
function setupIntro() {
  const intro = $("#intro"), form = $("#unlock"), input = $("#pw"), msg = $("#unlockMsg"), hint = $("#introHint");
  let stop = fallingPetals($(".intro-petals"), 14);
  let unlocked = false, contentReady = false;

  const open = () => {
    if (!unlocked) { form.classList.remove("bad"); void form.offsetWidth; form.classList.add("bad"); input.focus(); return; }
    if (intro.classList.contains("opened")) return;
    intro.classList.add("opened");
    setTimeout(() => party({ particleCount: 160, spread: 100, origin: { y: .55 } }), 900);
    setTimeout(() => {
      intro.classList.add("gone");
      document.body.classList.remove("is-locked");
      document.body.classList.add("ready");
      stop();
      setupPolaroids.layout && setupPolaroids.layout(false);
    }, 2600);
  };

  const onUnlocked = pw => {
    unlocked = true;
    store.set("nj-pw", pw);
    form.hidden = true; hint.hidden = false;
    if (!contentReady) { contentReady = true; setupPolaroids(); setupMemory(); }
  };

  const tryPw = async (pw, auto) => {
    form.classList.add("busy"); msg.textContent = auto ? "" : "Abriendo…";
    let ok = false;
    try { ok = await unlock(pw); } catch (e) { console.error(e); }
    form.classList.remove("busy");
    if (ok) { msg.textContent = ""; onUnlocked(pw); if (!auto) setTimeout(open, 250); }
    else if (!auto) {
      msg.textContent = "Mmm, esa no es. Revisa el mensaje donde te llegó la invitación 💌";
      form.classList.remove("bad"); void form.offsetWidth; form.classList.add("bad");
    }
  };

  form.addEventListener("submit", e => { e.preventDefault(); if (input.value.trim()) tryPw(input.value, false); });
  $("#seal").addEventListener("click", e => { e.stopPropagation(); open(); });
  $("#envelope").addEventListener("click", open);
  $("#replay").addEventListener("click", () => {
    scrollTo({ top: 0 });
    intro.classList.remove("opened", "gone");
    document.body.classList.add("is-locked");
    document.body.classList.remove("ready");
    stop = fallingPetals($(".intro-petals"), 14);
  });

  // ?clave=... en el link, o la clave guardada de una visita anterior
  const fromUrl = new URLSearchParams(location.search).get("clave");
  const saved = fromUrl || store.get("nj-pw");
  if (fromUrl) history.replaceState(null, "", location.pathname + location.hash);
  if (saved) { input.value = saved; tryPw(saved, true); }
}

/* ---------- cuenta regresiva ---------- */
function setupCountdown() {
  const target = new Date(CONFIG.inicio).getTime();
  const els = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  const set = (el, v) => { if (el.textContent !== v) { el.textContent = v; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); } };
  const tick = () => {
    let diff = Math.max(0, target - Date.now());
    if (diff === 0) {
      $("#countdown").hidden = true;
      $("#countdownNote").textContent = "¡Hoy es el día! 🎉";
      return;
    }
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    set(els.d, String(d)); set(els.h, String(h).padStart(2, "0"));
    set(els.m, String(m).padStart(2, "0")); set(els.s, String(s).padStart(2, "0"));
    setTimeout(tick, 1000);
  };
  tick();
}

/* ---------- easter egg en el "&" ---------- */
function setupAmp() {
  let clicks = 0;
  const msgs = ["💜", "¿Otra vez?", "Sigue…", "¡Casi!", "🎉 ¡Encontraste la sorpresa! Primer baile asegurado con los novios."];
  $("#amp").addEventListener("click", e => {
    burst(e.clientX, e.clientY, 14);
    toast(msgs[Math.min(clicks, msgs.length - 1)]);
    clicks++;
    if (clicks === 5) {
      const heart = window.confetti && confetti.shapeFromText ? confetti.shapeFromText({ text: "💜", scalar: 2 }) : null;
      party(heart ? { shapes: [heart], scalar: 2, particleCount: 60 } : {});
    }
  });
}

/* ---------- nav ---------- */
function setupNav() {
  const nav = $("#nav");
  const links = $$("a", nav);
  const onScroll = () => nav.classList.toggle("show", scrollY > innerHeight * .6);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => io.observe(s));
}

/* ---------- polaroids arrastrables ---------- */
function setupPolaroids() {
  const table = $("#polaroids");
  let z = 10;
  const cards = FOTOS.map(([src, cap]) => {
    const f = document.createElement("figure");
    f.className = "polaroid";
    f.innerHTML = `<img src="${photo(src)}" alt="${cap}"><figcaption>${cap}</figcaption>`;
    f.style.margin = "0";
    table.appendChild(f);
    return f;
  });

  const layout = (random) => {
    const W = table.clientWidth, H = table.clientHeight;
    const cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
    const cols = Math.max(2, Math.round(W / (cw * .85)));
    const rows = Math.ceil(cards.length / cols);
    cards.forEach((c, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const inRow = Math.min(cols, cards.length - row * cols);
      const step = cols > 1 ? (W - cw) / (cols - 1) : 0;
      const cx = (cols - inRow) * step / 2 + step * col;
      const cy = rows > 1 ? (H - ch) * row / (rows - 1) : 0;
      const jx = random ? (Math.random() - .5) * cw * .5 : (i % 3 - 1) * 10;
      const jy = random ? (Math.random() - .5) * ch * .3 : ((i * 7) % 5 - 2) * 8;
      const x = Math.min(Math.max(0, cx + jx), W - cw), y = Math.min(Math.max(0, cy + jy), H - ch);
      const r = random ? (Math.random() - .5) * 24 : ((i * 37) % 17) - 8;
      c.style.left = x + "px"; c.style.top = y + "px";
      c.style.transform = `rotate(${r}deg)`;
      c.dataset.r = r;
    });
  };
  setupPolaroids.layout = layout;
  requestAnimationFrame(() => layout(false));
  addEventListener("resize", () => layout(false));
  $("#shuffle").addEventListener("click", e => { layout(true); burst(e.clientX, e.clientY); });

  cards.forEach(c => {
    let sx, sy, ox, oy, moved = false, active = false;
    c.addEventListener("pointerdown", e => {
      active = true; moved = false;
      sx = e.clientX; sy = e.clientY; ox = c.offsetLeft; oy = c.offsetTop;
      c.setPointerCapture(e.pointerId);
      c.style.zIndex = ++z;
      c.classList.add("dragging");
      c.style.transform = `rotate(${c.dataset.r}deg) scale(1.06)`;
    });
    c.addEventListener("pointermove", e => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      const W = table.clientWidth - c.offsetWidth, H = table.clientHeight - c.offsetHeight;
      c.style.left = Math.min(Math.max(-20, ox + dx), W + 20) + "px";
      c.style.top = Math.min(Math.max(-20, oy + dy), H + 20) + "px";
    });
    const end = () => {
      if (!active) return;
      active = false;
      c.classList.remove("dragging");
      c.style.transform = `rotate(${c.dataset.r}deg)`;
      if (!moved) openLightbox(c.querySelector("img").src, c.querySelector("figcaption").textContent);
    };
    c.addEventListener("pointerup", end);
    c.addEventListener("pointercancel", () => { active = false; c.classList.remove("dragging"); });
  });
}

function openLightbox(src, cap) {
  const lb = $("#lightbox");
  $("img", lb).src = src;
  $(".lb-cap", lb).textContent = cap;
  lb.hidden = false;
}
function setupLightbox() {
  const lb = $("#lightbox");
  lb.addEventListener("click", e => { if (e.target !== $("img", lb)) lb.hidden = true; });
  addEventListener("keydown", e => { if (e.key === "Escape") lb.hidden = true; });
}

/* ---------- coordenadas ---------- */
function setupDetails() {
  if (CONFIG.lugar) $('[data-cfg="lugar"]').textContent = CONFIG.lugar;
  if (CONFIG.direccion) $('[data-cfg="direccion"]').textContent = CONFIG.direccion;

  $$(".card.flip").forEach(c => {
    const flip = () => c.classList.toggle("flipped");
    c.addEventListener("click", flip);
    c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  });

  const fmt = iso => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const where = [CONFIG.lugar, CONFIG.direccion].filter(Boolean).join(", ");
  const title = "Matrimonio Nata & Javi 💍";
  const details = "¡Nos casamos! Pisco sour, ceremonia, cordero al palo y bailoteo. " + location.href.split("#")[0];
  $("#gcal").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(title) +
    "&dates=" + fmt(CONFIG.inicio) + "/" + fmt(CONFIG.fin) +
    "&details=" + encodeURIComponent(details) +
    "&location=" + encodeURIComponent(where);

  const maps = $("#maps");
  if (where) maps.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(where);
  else maps.addEventListener("click", e => { e.preventDefault(); toast("La dirección llega pronto 📍"); });

  $("#ics").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NataJavi//ES", "BEGIN:VEVENT",
      "UID:nata-javi-20261205@matri", "DTSTAMP:" + fmt(new Date().toISOString()),
      "DTSTART:" + fmt(CONFIG.inicio), "DTEND:" + fmt(CONFIG.fin),
      "SUMMARY:" + title, "DESCRIPTION:" + details, "LOCATION:" + where,
      "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", "DESCRIPTION:¡Falta una semana para el matri!", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "matri-nata-javi.ics";
    a.click();
    toast("📅 ¡Agendado! Te avisamos una semana antes.");
  });
}

/* ---------- animaciones al hacer scroll ---------- */
function setupReveal() {
  $$(".heading, .cards, .menu, .rsvp, .bank, .memory").forEach(el => el.classList.add("reveal-on-scroll"));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: .15 });
  $$(".reveal-on-scroll, .timeline li").forEach(el => io.observe(el));

  const tl = $("#timeline");
  const onScroll = () => {
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .75 - r.top) / r.height));
    tl.style.setProperty("--progress", p);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- memorice ---------- */
function setupMemory() {
  const board = $("#memory");
  const movesEl = $("#moves"), timeEl = $("#time"), bestEl = $("#best"), win = $("#gameWin");
  let first = null, lock = false, moves = 0, found = 0, t0 = 0, timer = null;
  const best = () => { const b = store.get("nj-best"); bestEl.textContent = b ? b + " mov." : "—"; };
  best();

  const start = () => {
    board.innerHTML = ""; win.hidden = true;
    first = null; lock = false; moves = 0; found = 0; t0 = 0;
    clearInterval(timer); movesEl.textContent = 0; timeEl.textContent = "0:00";
    const deck = [...MEMORICE, ...MEMORICE].sort(() => Math.random() - .5);
    deck.forEach(src => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "mcard"; b.dataset.src = src;
      b.setAttribute("aria-label", "Carta");
      b.innerHTML = `<div class="mi"><div class="mf"><svg viewBox="-115 -115 230 230"><use href="#flower"/></svg></div><div class="mb"><img src="${photo(src)}" alt=""></div></div>`;
      b.addEventListener("click", () => flip(b));
      board.appendChild(b);
    });
  };

  const flip = b => {
    if (lock || b === first || b.classList.contains("done")) return;
    if (!t0) { t0 = Date.now(); timer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); timeEl.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }, 500); }
    b.classList.add("open");
    if (!first) { first = b; return; }
    moves++; movesEl.textContent = moves;
    if (first.dataset.src === b.dataset.src) {
      first.classList.add("done"); b.classList.add("done");
      const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 8);
      first = null; found++;
      if (found === MEMORICE.length) finish();
    } else {
      lock = true;
      const a = first; first = null;
      setTimeout(() => { a.classList.remove("open"); b.classList.remove("open"); lock = false; }, 850);
    }
  };

  const finish = () => {
    clearInterval(timer);
    const prev = +store.get("nj-best") || Infinity;
    if (moves < prev) store.set("nj-best", moves);
    best();
    win.hidden = false;
    win.textContent = moves <= 30
      ? `🎉 ¡${moves} movimientos en ${timeEl.textContent}! Muéstrale esto a los novios y cobra tu pisco sour.`
      : `🎉 ¡Lo lograste en ${moves} movimientos! Bajo 30 te ganas un pisco sour… ¿otra?`;
    party({ particleCount: 200, spread: 120 });
  };

  $("#restart").addEventListener("click", start);
  start();
}

/* ---------- RSVP ---------- */
function setupRsvp() {
  const form = $("#rsvpForm");
  const sync = () => form.classList.toggle("not-going", form.va.value === "no");
  $$('input[name="va"]', form).forEach(r => r.addEventListener("change", () => { sync(); if (form.va.value === "si") party({ particleCount: 60 }); }));
  sync();

  $$(".stepper button", form).forEach(btn => btn.addEventListener("click", () => {
    const inp = btn.parentElement.querySelector("input");
    inp.value = Math.min(+inp.max, Math.max(+inp.min, (+inp.value || 0) + +btn.dataset.step));
  }));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    if (!nombre) { form.nombre.classList.add("invalid"); form.nombre.focus(); setTimeout(() => form.nombre.classList.remove("invalid"), 600); return; }
    const va = form.va.value === "si";
    const lines = va ? [
      `💍 *Confirmación matri Nata & Javi*`,
      `✅ ¡Vamos!`,
      `👤 ${nombre}`,
      `🧑 Adultos: ${form.adultos.value}  ·  🧒 Niños: ${form.ninos.value}`,
      form.comida.value.trim() && `🍽️ Restricción: ${form.comida.value.trim()}`,
      form.cancion.value.trim() && `🎶 Canción: ${form.cancion.value.trim()}`,
      form.mensaje.value.trim() && `💌 ${form.mensaje.value.trim()}`,
    ] : [
      `💍 *Confirmación matri Nata & Javi*`,
      `❌ ${nombre} no podrá ir 😢`,
      form.mensaje.value.trim() && `💌 ${form.mensaje.value.trim()}`,
    ];
    const text = lines.filter(Boolean).join("\n");
    if (va) party({ particleCount: 220, spread: 120 });
    toast(va ? "¡Qué alegría! Abriendo WhatsApp…" : "Te vamos a extrañar 💜");
    setTimeout(() => open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank"), 700);
  });
}

/* ---------- regalos ---------- */
function setupGifts() {
  const wrap = $("#gifts");
  const qty = CONFIG.regalos.map(() => 0);
  let libre = 0;

  CONFIG.regalos.forEach((g, i) => {
    const el = document.createElement("article");
    el.className = "gift";
    el.innerHTML = g.libre
      ? `<span class="g-ico">${g.ico}</span><h3>${g.t}</h3><p>${g.d}</p>
         <input class="free" type="text" inputmode="numeric" placeholder="$ monto en CLP" aria-label="Monto libre">`
      : `<span class="g-ico">${g.ico}</span><h3>${g.t}</h3><p>${g.d}</p>
         <div class="g-foot"><span class="price">${clp(g.p)}</span>
         <div class="qty"><button type="button" data-d="-1" aria-label="Quitar">−</button><b>0</b><button type="button" data-d="1" aria-label="Agregar">+</button></div></div>`;
    wrap.appendChild(el);
    if (g.libre) {
      const inp = $("input", el);
      inp.addEventListener("input", () => {
        libre = +inp.value.replace(/\D/g, "") || 0;
        inp.value = libre ? libre.toLocaleString("es-CL") : "";
        el.classList.toggle("sel", libre > 0);
        update();
      });
    } else {
      $$("button", el).forEach(b => b.addEventListener("click", e => {
        qty[i] = Math.max(0, qty[i] + +b.dataset.d);
        $("b", el).textContent = qty[i];
        el.classList.toggle("sel", qty[i] > 0);
        if (+b.dataset.d > 0) burst(e.clientX, e.clientY, 6);
        update();
      }));
    }
  });

  const update = () => {
    const total = CONFIG.regalos.reduce((s, g, i) => s + g.p * qty[i], 0) + libre;
    $("#giftTotal").textContent = clp(total);
    $("#giftSend").disabled = total === 0;
    return total;
  };

  $("#giftSend").addEventListener("click", () => {
    const items = CONFIG.regalos.map((g, i) => qty[i] ? `• ${g.ico} ${g.t} x${qty[i]}` : null).filter(Boolean);
    if (libre) items.push(`• 💌 Aporte libre ${clp(libre)}`);
    const text = `🎁 *Regalo para Nata & Javi*\n${items.join("\n")}\nTotal: ${clp(update())}\n\n(¡Ya les transfiero!)`;
    party({ particleCount: 120 });
    open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
  });

  const dl = $("#bankData");
  dl.innerHTML = CONFIG.banco.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
  $("#copyBank").addEventListener("click", async () => {
    const txt = CONFIG.banco.map(([k, v]) => `${k}: ${v}`).join("\n");
    try { await navigator.clipboard.writeText(txt); toast("📋 Datos copiados"); }
    catch { toast("No se pudo copiar, cópialos a mano 🙏"); }
  });
}

/* ---------- pétalos al tocar ---------- */
function setupClickPetals() {
  document.addEventListener("click", e => {
    if (e.target.closest("button, a, input, textarea, label, .polaroid, .mcard, .lightbox")) return;
    burst(e.clientX, e.clientY, 7);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupIntro();
  setupCountdown();
  setupAmp();
  setupNav();
  setupLightbox();
  setupDetails();
  setupReveal();
  setupRsvp();
  setupGifts();
  setupClickPetals();
});
