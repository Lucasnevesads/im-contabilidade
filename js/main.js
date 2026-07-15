/* =========================================================
   IM Contabilidade, main.js
   Comportamentos compartilhados de todas as páginas.
   ========================================================= */

/* Número do WhatsApp para atendimento (formato internacional, sem símbolos).
   >>> Lucas: confirme com a amiga qual dos dois números é o de atendimento. <<<
   (91) 98805-0643  ->  5591988050643
   (91) 98379-9894  ->  5591983799894 */
window.IM_WHATSAPP = "5591988050643";

/* Monta a URL do WhatsApp com a mensagem já preenchida. */
function waLink(mensagem) {
  const texto = encodeURIComponent(mensagem || "Olá! Vim pelo site e gostaria de falar com a IM Contabilidade.");
  return `https://wa.me/${window.IM_WHATSAPP}?text=${texto}`;
}

document.addEventListener("DOMContentLoaded", () => {
  /* ---- Header muda no scroll ---- */
  const header = document.querySelector(".header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobile ---- */
  const toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => document.body.classList.toggle("nav-open"));
    document.querySelectorAll(".nav-mobile a").forEach((a) =>
      a.addEventListener("click", () => document.body.classList.remove("nav-open"))
    );
  }

  /* ---- Reveal ao rolar (efeito "Elementor") ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---- Contadores animados ---- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const dur = 1400;
          let start = null;
          const tick = (t) => {
            if (!start) start = t;
            const p = Math.min((t - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent = Number.isInteger(target) ? Math.round(val) : val.toFixed(1);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          co.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => co.observe(el));
  }

  /* ---- FAQ acordeão ---- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---- Aplica link do WhatsApp em qualquer [data-wa] ---- */
  document.querySelectorAll("[data-wa]").forEach((el) => {
    el.setAttribute("href", waLink(el.dataset.wa));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  /* ---- Pop-up de lead ---- */
  const overlay = document.getElementById("leadModal");
  if (overlay) {
    const open = () => overlay.classList.add("open");
    const close = () => overlay.classList.remove("open");

    document.querySelectorAll("[data-open-lead]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); open(); }));
    overlay.querySelectorAll("[data-close-lead]").forEach((b) => b.addEventListener("click", close));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    /* Abre sozinho após 18s (uma vez por sessão), estilo Contaja */
    if (!sessionStorage.getItem("im_lead_seen")) {
      setTimeout(() => {
        if (!overlay.classList.contains("open")) { open(); sessionStorage.setItem("im_lead_seen", "1"); }
      }, 18000);
    }

    /* Envio do form do pop-up -> WhatsApp */
    const form = overlay.querySelector("form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = form.querySelector('[name="nome"]').value.trim();
        const tel = form.querySelector('[name="telefone"]').value.trim();
        const assunto = form.querySelector('[name="assunto"]') ? form.querySelector('[name="assunto"]').value : "";
        const msg = `Olá! Meu nome é ${nome}.%0AAssunto: ${assunto}%0AMeu telefone: ${tel}%0AVim pelo site e gostaria de atendimento.`;
        window.open(waLink(decodeURIComponent(msg)), "_blank", "noopener");
        close();
      });
    }
  }

  /* ---- Ano no rodapé ---- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = "2026"));
});
