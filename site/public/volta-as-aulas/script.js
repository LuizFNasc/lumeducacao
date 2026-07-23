/* Lumeducação — Landing Volta às Aulas */
(function () {
  "use strict";

  /* ============================================================
     CONFIG — preencha aqui quando tiver os dados reais.
     Seções vazias ficam automaticamente escondidas.
     ============================================================ */
  var CONFIG = {
    // Depoimentos reais de clientes. Ex.:
    // { text: "Amei o material!", author: "Prof.ª Ana — 2º ano" }
    testimonials: [],
    // Canais de contato reais. Deixe "" para esconder o botão.
    contact: {
      whatsapp: "",  // ex: "https://wa.me/5511999999999"
      instagram: "", // ex: "https://instagram.com/lumeducacao"
      email: "",     // ex: "contato@lumeducacao.com.br"
    },
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Nav: fundo ao rolar + menu mobile ---------- */
  var nav = document.querySelector(".nav");
  function onScrollNav() {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  var burger = document.querySelector(".nav__burger");
  var drawer = document.querySelector(".nav__drawer");
  burger.addEventListener("click", function () {
    var open = drawer.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  drawer.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
      drawer.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Depoimentos (só com dados reais) ---------- */
  var quotesSection = document.getElementById("depoimentos");
  if (CONFIG.testimonials.length > 0) {
    var track = document.getElementById("quotes-track");
    CONFIG.testimonials.forEach(function (item) {
      var el = document.createElement("blockquote");
      el.className = "quote";
      var p = document.createElement("p");
      p.textContent = "“" + item.text + "”";
      var footer = document.createElement("footer");
      footer.textContent = item.author;
      el.appendChild(p);
      el.appendChild(footer);
      track.appendChild(el);
    });
    quotesSection.hidden = false;
    if (CONFIG.testimonials.length > 1) {
      var quotesNav = document.getElementById("quotes-nav");
      quotesNav.hidden = false;
      var step = 440;
      quotesNav.querySelector("[data-quote-prev]").addEventListener("click", function () {
        track.scrollBy({ left: -step, behavior: "smooth" });
      });
      quotesNav.querySelector("[data-quote-next]").addEventListener("click", function () {
        track.scrollBy({ left: step, behavior: "smooth" });
      });
    }
  }

  /* ---------- Contato (só canais preenchidos) ---------- */
  var contactWrap = document.getElementById("contact-links");
  var channels = [
    ["whatsapp", "WhatsApp", CONFIG.contact.whatsapp],
    ["instagram", "Instagram", CONFIG.contact.instagram],
    ["email", "E-mail", CONFIG.contact.email ? "mailto:" + CONFIG.contact.email : ""],
  ];
  channels.forEach(function (channel) {
    if (!channel[2]) return;
    var a = document.createElement("a");
    a.href = channel[2];
    a.textContent = channel[1];
    a.rel = "noopener";
    if (channel[0] !== "email") a.target = "_blank";
    contactWrap.appendChild(a);
  });

  /* ---------- Produtos: leitura automática do catálogo ---------- */
  var grid = document.getElementById("products-grid");
  var fallback = document.getElementById("products-fallback");
  var priceFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  function showFallback() {
    fallback.hidden = false;
  }

  fetch("/api/landing-products")
    .then(function (response) {
      if (!response.ok) throw new Error("api error");
      return response.json();
    })
    .then(function (data) {
      var products = (data && data.products) || [];
      if (products.length === 0) return showFallback();
      products.slice(0, 6).forEach(function (product) {
        var card = document.createElement("a");
        card.className = "product-card";
        card.href = "/produtos/" + encodeURIComponent(product.slug);

        var cover = document.createElement("div");
        cover.className = "product-card__cover";
        if (product.coverImageUrl) {
          var img = document.createElement("img");
          img.src = product.coverImageUrl;
          img.alt = product.title;
          img.loading = "lazy";
          cover.appendChild(img);
        } else {
          cover.textContent = "📚";
        }

        var body = document.createElement("div");
        body.className = "product-card__body";
        if (product.category) {
          var cat = document.createElement("span");
          cat.className = "product-card__cat";
          cat.textContent = product.category;
          body.appendChild(cat);
        }
        var title = document.createElement("h3");
        title.className = "product-card__title";
        title.textContent = product.title;
        var foot = document.createElement("div");
        foot.className = "product-card__foot";
        var price = document.createElement("span");
        price.className = "product-card__price";
        price.textContent = priceFormat.format(product.priceCents / 100);
        var go = document.createElement("span");
        go.className = "product-card__go";
        go.textContent = "Ver material →";
        foot.appendChild(price);
        foot.appendChild(go);
        body.appendChild(title);
        body.appendChild(foot);

        card.appendChild(cover);
        card.appendChild(body);
        grid.appendChild(card);
      });
      if (hasGsap && !reduceMotion) {
        window.gsap.from(grid.children, {
          opacity: 0, y: 40, duration: 0.7, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: grid, start: "top 82%" },
        });
        window.ScrollTrigger.refresh();
      }
    })
    .catch(showFallback);

  /* ---------- Animações (GSAP + Lenis) ---------- */
  if (!hasGsap || reduceMotion) {
    // Sem animação (preferência do usuário ou GSAP indisponível):
    // mostrar diretamente os estados finais.
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
    var stepsLine = document.querySelector(".steps__line i");
    if (stepsLine) stepsLine.style.transform = "scaleX(1)";
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // Scroll suave
  if (typeof window.Lenis !== "undefined") {
    var lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // âncoras internas via Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var id = anchor.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -60, duration: 1.2 });
      });
    });
  }

  // Hero: entrada cinematográfica
  var heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTl
    .from('[data-hero="eyebrow"]', { y: 24, opacity: 0, duration: 0.7 })
    .from('[data-hero="word"]', { yPercent: 110, duration: 0.85, stagger: 0.06 }, "-=0.35")
    .from('[data-hero="fade"]', { y: 26, opacity: 0, duration: 0.7, stagger: 0.12 }, "-=0.45")
    .from(".hero__photo", { scale: 1.12, opacity: 0, duration: 1.1, ease: "power2.out" }, 0.25)
    .from(".hero__card, .hero__chip, .hero__pencil", {
      y: 46, opacity: 0, duration: 0.9, stagger: 0.1, ease: "back.out(1.6)",
    }, "-=0.7");

  // Hero: parallax por camada no scroll
  document.querySelectorAll(".hero [data-depth]").forEach(function (layer) {
    var depth = parseFloat(layer.getAttribute("data-depth"));
    gsap.to(layer, {
      yPercent: depth * -60,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  });

  // Hero: flutuação contínua sutil
  gsap.to(".hero__card--luva", { y: -10, rotate: -5.4, duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".hero__chip--a", { y: -8, duration: 2.8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.4 });
  gsap.to(".hero__chip--b", { y: -12, duration: 3.1, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.9 });
  gsap.to(".hero__pencil", { rotate: 20, y: 8, duration: 4.2, yoyo: true, repeat: -1, ease: "sine.inOut" });

  // Reveals genéricos
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    gsap.from(el, {
      opacity: 0, y: 48, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 84%" },
    });
  });

  // Fotos das features: leve zoom-out ao entrar
  gsap.utils.toArray(".feature__media img").forEach(function (img) {
    gsap.from(img, {
      scale: 1.18, duration: 1.4, ease: "power2.out",
      scrollTrigger: { trigger: img, start: "top 85%" },
    });
  });

  // Capas reais do painel fundamental
  gsap.from(".fund-cover", {
    scale: 0.6, opacity: 0, duration: 0.8, stagger: 0.12, ease: "back.out(1.7)",
    scrollTrigger: { trigger: ".feature__panel--fund", start: "top 78%" },
  });

  // Card de destaque (Palavrinhas Mágicas) na Educação Infantil
  gsap.from(".feature__accent", {
    scale: 0.7, opacity: 0, duration: 0.7, ease: "back.out(1.6)",
    scrollTrigger: { trigger: ".feature__accent", start: "top 85%" },
  });

  // Contadores
  gsap.utils.toArray("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var state = { value: 0 };
    gsap.to(state, {
      value: target, duration: 1.6, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      onUpdate: function () { el.textContent = Math.round(state.value) + suffix; },
    });
  });

  // Linha de progresso dos passos
  gsap.set(".steps__line i", { scaleX: 0 });
  gsap.to(".steps__line i", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: ".steps", start: "top 75%", end: "bottom 60%", scrub: 0.6 },
  });

  // Categorias: deslocamento horizontal sutil conforme o scroll vertical (desktop)
  ScrollTrigger.matchMedia({
    "(min-width: 1025px)": function () {
      var track = document.querySelector(".cat-scroller__track");
      var scroller = document.querySelector(".cat-scroller");
      var distance = track.scrollWidth - scroller.clientWidth;
      if (distance > 80) {
        gsap.to(track, {
          x: -Math.min(distance, 480), ease: "none",
          scrollTrigger: { trigger: "#categorias", start: "top 70%", end: "bottom 20%", scrub: 0.8 },
        });
      }
    },
  });

  // Finale: blobs em parallax
  gsap.to(".finale__blob--a", {
    y: 120, ease: "none",
    scrollTrigger: { trigger: ".finale", start: "top bottom", end: "bottom top", scrub: true },
  });
  gsap.to(".finale__blob--b", {
    y: -100, ease: "none",
    scrollTrigger: { trigger: ".finale", start: "top bottom", end: "bottom top", scrub: true },
  });

  // As imagens alteram a altura da página ao carregar — recalcular os
  // pontos de disparo garante que nenhuma seção fique presa invisível.
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
