/* =========================================================
   💚 LÓGICA DE LA PÁGINA
   ---------------------------------------------------------
   Para cambiar los mensajes, edita la lista MESSAGES.
   Puedes agregar o quitar elementos: el contador
   "Mensaje X de N" se ajusta solo.
   El ÚLTIMO elemento se muestra como mensaje de cierre.
   ========================================================= */

const MESSAGES = [
  { icon: "🌿", text: "A veces, mis palabras no son suficientes para expresar lo que siento." },
  { icon: "💚", text: "Pero quiero que sepas que te amo tanto, de aquí a Saturno en pasitos de perezoso." },
  { icon: "🌸", text: "Que sepas que ante mis ojos eres una mujer perfecta y maravillosa." },
  { icon: "🍃", text: "Deseo pasar el resto de mis días a tu lado y despertar junto a ti." },
  { icon: "☀️", text: "Incluso los días difíciles, siempre quiero estar contigo y ser tu compañia fiel." },
  { icon: "🌱", text: "Quiero hacerte feliz y que te sientas segura a mi lado en todo momento." },
  { icon: "✨", text: "Y siempre buscaré la manera de sacarte una sonrisa y hacerte feliz." },
  { icon: "💚", text: "Y si llegaste hasta aquí, espero haber logrado explicarte un poquito de lo perfecta que eres ante mis ojos, mi manzanita." }
];

/* Textos de los botones */
const TEXT_NEXT = "Dale preciosa 🌸";
const TEXT_RESTART = "Volver a comenzar 🌱";

/* Emojis que flotan en el fondo (cámbialos si quieres) */
const FLOATERS = ["🌿", "🍃", "🌸", "💚", "✨", "🌱", "🤍"];
const FLOATER_COUNT = 16;   // menos = más tranquilo

/* ---------- Referencias a elementos ---------- */
const intro = document.getElementById("intro");
const story = document.getElementById("story");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const card = document.getElementById("card");
const cardIcon = document.getElementById("cardIcon");
const cardText = document.getElementById("cardText");
const progressText = document.getElementById("progressText");
const barFill = document.getElementById("barFill");
const floatersBox = document.getElementById("floaters");

let current = 0;        // índice del mensaje que se está mostrando
let busy = false;       // evita pulsar mientras hay una animación

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (min, max) => Math.random() * (max - min) + min;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Fondo animado: pétalos y corazones ---------- */
function createFloaters() {
  if (reduceMotion) return;
  for (let i = 0; i < FLOATER_COUNT; i++) {
    const el = document.createElement("span");
    el.className = "floater" + (i % 4 === 0 ? " rise" : ""); // 1 de cada 4 sube
    el.textContent = FLOATERS[Math.floor(Math.random() * FLOATERS.length)];
    el.style.setProperty("--x", rand(0, 96) + "vw");
    el.style.setProperty("--size", rand(14, 28) + "px");
    el.style.setProperty("--dur", rand(12, 24) + "s");
    el.style.setProperty("--delay", -rand(0, 24) + "s"); // delay negativo: ya están en movimiento
    el.style.setProperty("--drift", rand(-60, 60) + "px");
    floatersBox.appendChild(el);
  }
}

/* ---------- Chispas al pulsar un botón ---------- */
function burst(button, count = 7) {
  if (reduceMotion) return;
  const r = button.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const symbols = ["💚", "✨", "🌿", "🌸"];

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    s.style.left = cx + "px";
    s.style.top = cy + "px";
    s.style.setProperty("--dx", rand(-110, 110) + "px");
    s.style.setProperty("--dy", rand(-130, -30) + "px");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

/* ---------- Mostrar un mensaje ---------- */
function renderMessage(index) {
  const msg = MESSAGES[index];
  const isLast = index === MESSAGES.length - 1;

  // El texto se divide en palabras para que aparezcan una a una
  cardText.innerHTML = "";
  msg.text.split(" ").forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "w";
    span.style.setProperty("--i", i);
    span.textContent = word;
    cardText.appendChild(span);
    cardText.appendChild(document.createTextNode(" "));
  });

  cardIcon.textContent = msg.icon;
  card.classList.toggle("final", isLast);

  progressText.textContent = `Mensaje ${index + 1} de ${MESSAGES.length}`;
  barFill.style.width = ((index + 1) / MESSAGES.length) * 100 + "%";

  nextBtn.textContent = isLast ? TEXT_RESTART : TEXT_NEXT;

  // Reinicia la animación de entrada del cuadro
  card.classList.remove("leave", "enter");
  void card.offsetWidth;            // fuerza el reinicio de la animación
  card.classList.add("enter");
}

/* ---------- Eventos ---------- */

// 1) Abrir la sorpresa: pasa de la bienvenida al primer mensaje
startBtn.addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  burst(startBtn, 9);
  intro.classList.add("leaving");
  await wait(reduceMotion ? 0 : 450);
  intro.classList.add("hidden");
  story.classList.remove("hidden");
  current = 0;
  renderMessage(current);
  busy = false;
});

// 2) Siguiente / Volver a comenzar
nextBtn.addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  const wasLast = current === MESSAGES.length - 1;

  burst(nextBtn, wasLast ? 6 : 8);

  // El cuadro actual se desvanece...
  card.classList.remove("enter");
  card.classList.add("leave");
  await wait(reduceMotion ? 0 : 400);

  if (wasLast) {
    // ...y si era el último, volvemos a la pantalla inicial
    story.classList.add("hidden");
    intro.classList.remove("hidden", "leaving");
    intro.style.animation = "none";
    void intro.offsetWidth;
    intro.style.animation = "";
    current = 0;
  } else {
    // ...y aparece el siguiente mensaje
    current++;
    renderMessage(current);

    // Lluvia extra de corazones en el mensaje final 💚
    if (current === MESSAGES.length - 1) {
      setTimeout(() => burst(card, 14), 500);
    }
  }
  busy = false;
});

/* ---------- Inicio ---------- */
createFloaters();