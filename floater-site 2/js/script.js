/* ===========================================================
   FLOATER — lógica del prototipo (catálogo, carrito, checkout, drops ocultos)
   =========================================================== */

// ---------- Analytics (GA4) ----------
// Envía eventos a Google Analytics si el snippet de gtag (en el <head> de
// cada página) ya cargó. Si todavía no cargó (bloqueador de anuncios, sin
// conexión, etc.) simplemente no hace nada — nunca rompe la compra.
function gaEvent(name, params){
  if(typeof gtag === "function"){
    gtag("event", name, params || {});
  }
}
function productToGaItem(product, extra){
  return Object.assign({
    item_id: product.id,
    item_name: product.name,
    price: product.price || 0
  }, extra || {});
}

// ---------- Loop de fotos de fondo (home) ----------
// Para agregar una foto nueva al loop, sumarla acá nomás — el resto es automático.
const LANDING_BG_LOOP = [
  "assets/hero/floater-hero-v5.png",
  "assets/hero/loop-03.png",
  "assets/hero/loop-04.png"
];
const LANDING_BG_INTERVAL_MS = 10000;

function initLandingBgLoop(){
  const wrap = document.querySelector("[data-landing-bg]");
  if(!wrap || LANDING_BG_LOOP.length === 0) return;

  wrap.innerHTML = LANDING_BG_LOOP.map((src, i) =>
    `<div class="landing__bg-slide${i === 0 ? " is-active" : ""}" style="background-image:url('${src}')"></div>`
  ).join("");

  if(LANDING_BG_LOOP.length < 2) return; // una sola foto: no hace falta rotar

  const slides = Array.from(wrap.querySelectorAll(".landing__bg-slide"));
  let current = 0;
  setInterval(() => {
    const next = (current + 1) % slides.length;
    slides[current].classList.remove("is-active");
    slides[next].classList.add("is-active");
    current = next;
  }, LANDING_BG_INTERVAL_MS);
}

// ---------- Catálogo (datos de producto) ----------
// Se van sumando acá a medida que llegan fotos y datos de cada prenda.
const PRODUCTS = [
  {
    id: "remera-tsixx",
    name: "REMERA MANGA LARGA TSIXX",
    category: "remeras",
    price: 0, // pendiente de definir
    onSale: false,
    salePrice: null,
    sizes: ["S", "M", "L", "XL"],
    description: "Texto pendiente de confirmar con la marca.",
    material: "Pendiente",
    fit: "Regular",
    images: {
      frente: "assets/products/remera-tsixx/frente-cutout.png",
      espalda: "assets/products/remera-tsixx/espalda.jpg" // falta subir
    }
  },
  {
    id: "remera-negra-tsixx",
    name: "REMERA MANGA CORTA NEGRA TSIXX",
    category: "remeras",
    price: 0, // pendiente de definir
    onSale: false,
    salePrice: null,
    sizes: ["S", "M", "L", "XL"],
    description: "Texto pendiente de confirmar con la marca.",
    material: "Pendiente",
    fit: "Regular",
    images: {
      frente: "assets/products/remera-negra-tsixx/frente-cutout.png"
      // sin espalda: la parte de atrás es lisa, no tiene foto propia
    }
  },
  {
    id: "remera-blanca-tsixx",
    name: "REMERA MANGA LARGA BLANCA TSIXX",
    category: "remeras",
    price: 0, // pendiente de definir
    onSale: false,
    salePrice: null,
    sizes: ["S", "M", "L", "XL"],
    description: "Texto pendiente de confirmar con la marca.",
    material: "Pendiente",
    fit: "Regular",
    images: {
      frente: "assets/products/remera-blanca-tsixx/frente-cutout.png",
      espalda: "assets/products/remera-blanca-tsixx/espalda-cutout.png"
    }
  }
  // Cuando lleguen los jeans/jorts, se suman acá con category: "jeans"
];

// ---------- Drops ocultos ("hidden gems") ----------
// No aparecen en el catálogo normal. Solo se llega acá tocando un hallazgo
// escondido en alguna página del sitio (ver .hidden-gem). Cada uno tiene
// stock limitado y una experiencia de compra ultra rápida.
const SECRET_DROPS = [
  {
    id: "drop-01",
    name: "PIEZA OCULTA 01",
    price: 0, // pendiente de definir
    stock: 1,
    sizes: ["Único"],
    description: "Pendiente — se completa cuando llegue el producto real. Edición limitada, no vuelve a salir.",
    material: "Pendiente",
    images: {
      frente: "assets/drops/drop-01/frente.jpg",
      espalda: "assets/drops/drop-01/espalda.jpg"
    }
  }
];

function findAnyProduct(id){
  return PRODUCTS.find(p => p.id === id) || SECRET_DROPS.find(p => p.id === id);
}

function formatPrice(n){
  if(!n) return "Precio a confirmar";
  return new Intl.NumberFormat("es-AR", { style:"currency", currency:"ARS", maximumFractionDigits:0 }).format(n);
}

// ---------- Carrito (localStorage) ----------
const CART_KEY = "floater_cart";

function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
// Devuelve true/false en vez de frenar todo con un alert() nativo — así cada
// pantalla que llama a addToCart decide cómo avisar (mensaje inline, etc.).
function addToCart(productId, size){
  if(!size) return false;
  const cart = getCart();
  const existing = cart.find(i => i.productId === productId && i.size === size);
  if(existing){ existing.qty += 1; }
  else{ cart.push({ productId, size, qty: 1, selected: true }); }
  saveCart(cart);

  const product = findAnyProduct(productId);
  if(product){
    gaEvent("add_to_cart", {
      currency: "ARS",
      value: product.price || 0,
      items: [productToGaItem(product, { item_variant: size, quantity: 1 })]
    });
  }
  return true;
}
function removeFromCart(index){
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}
function updateQty(index, delta){
  const cart = getCart();
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart(cart);
  renderCartPage();
}
function toggleSelected(index, checked){
  const cart = getCart();
  cart[index].selected = checked;
  saveCart(cart);
  renderCartPage();
}
// Un item se considera "para comprar ahora" salvo que lo hayan destildado
// explícitamente (para no romper carritos guardados de antes de este cambio).
function isSelected(item){
  return item.selected !== false;
}
function cartCount(){
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}
function updateCartCount(){
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = cartCount();
  });
}

// ---------- Header / menú mobile ----------
function initHeader(){
  updateCartCount();
  const menuBtn = document.querySelector("[data-menu-open]");
  const menuClose = document.querySelector("[data-menu-close]");
  const menu = document.querySelector(".mobile-menu");
  if(menuBtn && menu){
    menuBtn.addEventListener("click", () => menu.classList.add("is-open"));
  }
  if(menuClose && menu){
    menuClose.addEventListener("click", () => menu.classList.remove("is-open"));
  }
}

// ---------- Navegación entre páginas (sitio entero) ----------
// Mapa de todos los links internos del sitio → a qué archivo .html llevan.
// Sirve como referencia y como red de seguridad: cualquier link interno
// (esté en la home, en el menú desplegable, en el footer o donde sea)
// navega explícitamente por JS y cierra menú/carrito antes de irse,
// para que la transición se vea prolija y no dependa solo del href nativo.
const SITE_ROUTES = {
  "Home": "index.html",
  "Catálogo": "catalog.html",
  "Ofertas": "ofertas.html",
  "Nuevos productos": "nuevos.html",
  "Carrito (página completa)": "cart.html",
  "Contacto": "contacto.html",
  "Acceso exclusivo / Perfil": "perfil.html",
  "Producto": "product.html",
  "Checkout": "checkout.html"
};

function initSiteNavigation(){
  // Delegado en document: agarra CUALQUIER link interno del sitio,
  // sea de la home, del menú, del footer, o de una página nueva que
  // se agregue más adelante — no hace falta cablear cada botón a mano.
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if(!link) return;
    const href = link.getAttribute("href");
    if(!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;

    // Dejamos pasar clicks con modificador (ctrl/cmd/shift/click del medio)
    // para no romper "abrir en pestaña nueva".
    if(e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;

    const menu = document.querySelector(".mobile-menu");
    if(menu) menu.classList.remove("is-open");
    const drawer = document.querySelector("[data-cart-drawer]");
    if(drawer) drawer.classList.remove("is-open");

    // Navegación explícita y determinística: no depende de que el
    // comportamiento nativo del <a> se dispare correctamente.
    e.preventDefault();
    window.location.href = href;
  });
}

// ---------- Carrito desplegable (drawer) ----------
function initCartDrawer(){
  const drawer = document.querySelector("[data-cart-drawer]");
  if(!drawer) return; // esta página no tiene drawer (ej: cart.html, que es la versión de página completa)
  const openBtns = document.querySelectorAll("[data-cart-open]");
  const closeEls = document.querySelectorAll("[data-cart-drawer-close]");

  openBtns.forEach(btn => btn.addEventListener("click", () => drawer.classList.add("is-open")));
  closeEls.forEach(el => el.addEventListener("click", () => drawer.classList.remove("is-open")));

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") drawer.classList.remove("is-open");
  });
}

// ---------- Scroll reveal ----------
function initScrollReveal(){
  const items = document.querySelectorAll(".reveal");
  if(!items.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => obs.observe(el));
}

// ---------- Galería de fotos con zoom (compartida: producto + drop) ----------
function initStageZoom(stage){
  const img = stage.querySelector("img");
  if(!img) return;
  stage.onmousemove = (e) => {
    const rect = stage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  };
  stage.onmouseenter = () => stage.classList.add("is-zoomed");
  stage.onmouseleave = () => stage.classList.remove("is-zoomed");
}

const VIEW_LABELS = { frente: "Frente", espalda: "Espalda", detalle: "Detalle" };

function initGallery(product){
  const stage = document.querySelector("[data-gallery-stage]");
  const tabsWrap = document.querySelector("[data-gallery-tabs]");
  if(!stage) return;

  // Solo se arman tabs para las fotos que el producto realmente tiene
  // (algunas prendas no tienen foto de espalda, por ejemplo).
  const views = Object.keys(product.images).filter(k => !!product.images[k]);
  let currentView = views[0];

  function renderStage(){
    stage.innerHTML = `<img src="${product.images[currentView]}" alt="${product.name} (${currentView})" decoding="async"
      onerror="this.parentElement.innerHTML='<span class=&quot;placeholder-note&quot;>Foto ${currentView} pendiente</span>'">`;
    initStageZoom(stage);
  }
  renderStage();

  if(tabsWrap){
    if(views.length <= 1){
      // Una sola foto: no hace falta selector.
      tabsWrap.style.display = "none";
    } else {
      tabsWrap.style.display = "";
      tabsWrap.innerHTML = views.map((v, i) =>
        `<button data-gallery-tab="${v}" class="${i === 0 ? "is-active" : ""}">${VIEW_LABELS[v] || v}</button>`
      ).join("");
      tabsWrap.querySelectorAll("[data-gallery-tab]").forEach(btn => {
        btn.addEventListener("click", () => {
          currentView = btn.getAttribute("data-gallery-tab");
          tabsWrap.querySelectorAll("[data-gallery-tab]").forEach(b => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          renderStage();
        });
      });
    }
  }
}

// ---------- Selector de talle (compartido: producto + drop) ----------
function initSizeGrid(product){
  const sizeGrid = document.querySelector("[data-size-grid]");
  let selectedSize = null;
  if(sizeGrid){
    sizeGrid.innerHTML = product.sizes.map(s => `<button data-size="${s}">${s}</button>`).join("");
    sizeGrid.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedSize = btn.getAttribute("data-size");
        sizeGrid.querySelectorAll("button").forEach(b => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
      });
    });
  }
  return { get: () => selectedSize };
}

// ---------- Render: catálogo (index/catalog) ----------
function renderCatalogList(containerSelector){
  const container = document.querySelector(containerSelector);
  if(!container) return;

  if(PRODUCTS.length === 0){
    container.innerHTML = `<p class="catalog-empty">Todavía no hay productos cargados. Muy pronto vas a encontrar acá las primeras piezas.</p>`;
    return;
  }

  container.innerHTML = PRODUCTS.map(catalogCardHTML).join("");
}

// ---------- Render: destacados en la home (últimos 3 productos) ----------
function renderHomeFeatured(){
  const wrap = document.querySelector("[data-home-featured-wrap]");
  const container = document.querySelector("[data-home-featured-list]");
  if(!wrap || !container) return;
  if(PRODUCTS.length === 0){
    wrap.style.display = "none";
    return;
  }
  container.innerHTML = PRODUCTS.slice(-3).map(catalogCardHTML).join("");
}

const CATEGORY_LABELS = { remeras: "Remeras", jeans: "Jeans" };

// Agregado rápido desde la tarjeta del catálogo: si el producto tiene un
// solo talle, un botón alcanza; si tiene varios, cada talle agrega directo
// al tocarlo (no hace falta "elegir y después confirmar" — un toque menos).
// Los controles quedan FUERA del <a> de la tarjeta (no anidados adentro)
// para no navegar a la ficha del producto sin querer al tocarlos.
function quickAddControlsHTML(p){
  const sizes = p.sizes || [];
  if(sizes.length === 0) return "";
  if(sizes.length === 1){
    return `<button type="button" class="quick-add__btn" data-quick-add-product="${p.id}" data-quick-add-size="${sizes[0]}">Agregar al carrito</button>`;
  }
  return `
    <div class="quick-add__sizes">
      ${sizes.map(s => `<button type="button" class="quick-add__size" data-quick-add-product="${p.id}" data-quick-add-size="${s}">${s}</button>`).join("")}
    </div>
  `;
}

function catalogCardHTML(p){
  return `
    <div class="catalog-item reveal">
      <a class="catalog-item__link" href="product.html?id=${p.id}">
        <div class="catalog-item__img">
          <img src="${p.images.frente}" alt="${p.name}" loading="lazy" decoding="async"
               onerror="this.closest('.catalog-item__img').innerHTML='<span class=&quot;placeholder-note&quot;>Foto pendiente — ${p.name}</span>'">
        </div>
        <div class="catalog-item__info">
          <div class="name">${p.name}</div>
          <div class="price">${p.onSale && p.salePrice ? `<span style="text-decoration:line-through;color:var(--gray-light);margin-right:6px;">${formatPrice(p.price)}</span>${formatPrice(p.salePrice)}` : formatPrice(p.price)}</div>
        </div>
      </a>
      <div class="quick-add" data-quick-add-wrap="${p.id}">
        ${quickAddControlsHTML(p)}
        <p class="quick-add__feedback" data-quick-add-feedback aria-live="polite"></p>
      </div>
    </div>
  `;
}

// Delegado en document (como initSiteNavigation): agarra los clicks de
// "agregar rápido" de cualquier tarjeta, esté donde esté (catálogo, home,
// ofertas, nuevos, relacionados) sin tener que recablear nada por página.
function initQuickAdd(){
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-quick-add-size]");
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const productId = btn.getAttribute("data-quick-add-product");
    const size = btn.getAttribute("data-quick-add-size");
    const added = addToCart(productId, size);
    if(!added) return;

    const wrap = btn.closest("[data-quick-add-wrap]");
    if(!wrap) return;
    wrap.classList.add("is-added");
    const feedback = wrap.querySelector("[data-quick-add-feedback]");
    if(feedback) feedback.textContent = `Agregado (talle ${size}) ✓`;
    clearTimeout(wrap._quickAddTimer);
    wrap._quickAddTimer = setTimeout(() => {
      wrap.classList.remove("is-added");
      if(feedback) feedback.textContent = "";
    }, 1600);
  });
}

// ---------- Render: Nuevos productos (últimos 2 de cada categoría) ----------
function renderNewestByCategory(containerSelector){
  const container = document.querySelector(containerSelector);
  if(!container) return;

  if(PRODUCTS.length === 0){
    container.innerHTML = `<p class="catalog-empty">Todavía no hay productos cargados.</p>`;
    return;
  }

  const byCategory = {};
  PRODUCTS.forEach(p => {
    const cat = p.category || "otros";
    if(!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  });

  const sections = Object.keys(byCategory).map(cat => {
    const items = byCategory[cat].slice(-2); // los últimos 2 agregados a esa categoría
    return `
      <div class="newest-section">
        <p class="eyebrow" style="text-align:center;">${CATEGORY_LABELS[cat] || cat}</p>
        <div class="catalog-list" style="padding-top:0;">
          ${items.map(catalogCardHTML).join("")}
        </div>
      </div>
    `;
  });

  container.innerHTML = sections.join("");
}

// ---------- Render: Ofertas (solo lo que tenga onSale = true) ----------
function renderOffers(containerSelector){
  const container = document.querySelector(containerSelector);
  const emptyMsg = document.querySelector("[data-offers-empty]");
  if(!container) return;

  const onSale = PRODUCTS.filter(p => p.onSale);
  if(onSale.length === 0){
    container.innerHTML = "";
    if(emptyMsg) emptyMsg.style.display = "block";
    return;
  }
  if(emptyMsg) emptyMsg.style.display = "none";
  container.innerHTML = onSale.map(catalogCardHTML).join("");
}

// ---------- Render: página de producto ----------
function renderProductPage(){
  if(!document.querySelector(".product-view")) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || (PRODUCTS[0] && PRODUCTS[0].id);
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  if(!product) return;

  document.querySelectorAll("[data-product-name]").forEach(el => el.textContent = product.name);
  document.querySelectorAll("[data-product-price]").forEach(el => el.textContent = formatPrice(product.price));
  document.querySelectorAll("[data-product-desc]").forEach(el => el.textContent = product.description);
  document.querySelectorAll("[data-product-material]").forEach(el => el.textContent = product.material);
  document.querySelectorAll("[data-product-fit]").forEach(el => el.textContent = product.fit);
  document.title = `${product.name} — FLOATER`;
  const descMeta = document.querySelector("[data-page-description]");
  if(descMeta) descMeta.setAttribute("content", `${product.name} — ${product.description} FLOATER, streetwear de autor.`);

  gaEvent("view_item", {
    currency: "ARS",
    value: product.price || 0,
    items: [productToGaItem(product)]
  });

  // Breadcrumb: Home / Categoría / Producto — ayuda a orientarse y a SEO.
  const crumb = document.querySelector("[data-breadcrumb]");
  if(crumb){
    const categoryLabel = CATEGORY_LABELS[product.category] || product.category || "Catálogo";
    crumb.innerHTML = `
      <a href="index.html">Home</a>
      <span>/</span>
      <a href="catalog.html">${categoryLabel}</a>
      <span>/</span>
      <span aria-current="page">${product.name}</span>
    `;
  }

  initGallery(product);
  const sizeCtl = initSizeGrid(product);
  const sizeError = document.querySelector("[data-size-error]");

  // Si el talle no se eligió, mostramos un mensaje inline en vez de un
  // alert() nativo — lo comparten "agregar al carrito" y "comprar ahora".
  function requireSize(){
    const size = sizeCtl.get();
    if(size){
      if(sizeError) sizeError.style.display = "none";
      return size;
    }
    if(sizeError){
      sizeError.textContent = "Elegí un talle antes de continuar.";
      sizeError.style.display = "block";
    }
    document.querySelector("[data-size-grid]")?.scrollIntoView({ block: "center", behavior: "smooth" });
    return null;
  }

  const addBtn = document.querySelector("[data-add-to-cart]");
  if(addBtn){
    addBtn.addEventListener("click", () => {
      const size = requireSize();
      if(!size) return;
      addToCart(product.id, size);
      addBtn.textContent = "Agregado ✓";
      setTimeout(() => { addBtn.textContent = "Agregar al carrito"; }, 1400);
    });
  }

  // "Comprar ahora": agrega y va directo a checkout, sin pasar por el
  // carrito — el mismo atajo que ya usaban los drops ocultos.
  const buyNowBtn = document.querySelector("[data-buy-now]");
  if(buyNowBtn){
    buyNowBtn.addEventListener("click", () => {
      const size = requireSize();
      if(!size) return;
      addToCart(product.id, size);
      window.location.href = "checkout.html";
    });
  }

  // Productos relacionados: misma categoría primero, resto del catálogo después.
  const relWrap = document.querySelector("[data-related-wrap]");
  const relList = document.querySelector("[data-related-list]");
  if(relWrap && relList){
    const others = PRODUCTS.filter(p => p.id !== product.id);
    const sameCategory = others.filter(p => p.category === product.category);
    const rest = others.filter(p => p.category !== product.category);
    const related = [...sameCategory, ...rest].slice(0, 3);
    if(related.length > 0){
      relList.innerHTML = related.map(catalogCardHTML).join("");
      relWrap.style.display = "block";
    }
  }
}

// ---------- Render: página de drop oculto ----------
function renderDropPage(){
  if(!document.querySelector(".drop-view")) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || (SECRET_DROPS[0] && SECRET_DROPS[0].id);
  const product = SECRET_DROPS.find(p => p.id === id) || SECRET_DROPS[0];
  if(!product) return;

  document.querySelectorAll("[data-product-name]").forEach(el => el.textContent = product.name);
  document.querySelectorAll("[data-product-desc]").forEach(el => el.textContent = product.description);
  document.querySelectorAll("[data-product-material]").forEach(el => el.textContent = product.material);
  document.querySelectorAll("[data-drop-price]").forEach(el => el.textContent = formatPrice(product.price));
  document.querySelectorAll("[data-drop-stock]").forEach(el => {
    el.textContent = product.stock === 1 ? "Queda 1 unidad" : `Quedan ${product.stock} unidades`;
  });
  document.title = `${product.name} — acceso oculto — FLOATER`;

  gaEvent("view_item", {
    currency: "ARS",
    value: product.price || 0,
    items: [productToGaItem(product)]
  });

  initGallery(product);
  const sizeCtl = initSizeGrid(product);
  const sizeError = document.querySelector("[data-size-error]");

  // Compra rápida: agrega al carrito y va directo a checkout, sin pasos de más.
  const buyBtn = document.querySelector("[data-quick-buy]");
  if(buyBtn){
    buyBtn.addEventListener("click", () => {
      const size = sizeCtl.get() || (product.sizes.length === 1 ? product.sizes[0] : null);
      if(!size){
        // Mensaje inline en vez de alert() nativo (si la página todavía no
        // tiene el elemento de error, no frenamos nada, solo no navegamos).
        if(sizeError){
          sizeError.textContent = "Elegí un talle antes de comprar.";
          sizeError.style.display = "block";
        }
        return;
      }
      addToCart(product.id, size);
      window.location.href = "checkout.html";
    });
  }
}

// ---------- Render: carrito ----------
function renderCartPage(){
  const container = document.querySelector("[data-cart-list]");
  const summary = document.querySelector("[data-cart-summary]");
  const empty = document.querySelector("[data-cart-empty]");
  if(!container) return;

  const cart = getCart();
  if(cart.length === 0){
    container.innerHTML = "";
    if(summary) summary.style.display = "none";
    if(empty) empty.style.display = "block";
    return;
  }
  if(empty) empty.style.display = "none";
  if(summary) summary.style.display = "flex";

  let total = 0;
  let savedTotal = 0;
  let savedCount = 0;
  container.innerHTML = cart.map((item, index) => {
    const product = findAnyProduct(item.productId);
    if(!product) return "";
    const lineTotal = product.price * item.qty;
    const selected = isSelected(item);
    if(selected){ total += lineTotal; }
    else{ savedTotal += lineTotal; savedCount += 1; }
    return `
      <div class="cart-row ${selected ? "" : "cart-row--saved"}">
        <label class="cart-row__check">
          <input type="checkbox" data-select="${index}" ${selected ? "checked" : ""}>
        </label>
        <div class="cart-row__img">
          <img src="${product.images.frente}" alt="${product.name}" loading="lazy" decoding="async"
               onerror="this.parentElement.innerHTML='<span class=&quot;placeholder-note&quot;>Foto pendiente</span>'">
        </div>
        <div>
          <div class="cart-row__name">${product.name}</div>
          <div class="cart-row__meta">Talle ${item.size}</div>
          <div class="cart-row__meta cart-row__saved-tag">${selected ? "Comprar ahora" : "Guardado para después"}</div>
          <div class="cart-row__remove" data-remove="${index}" style="cursor:pointer;">Quitar</div>
        </div>
        <div class="cart-row__qty">
          <button data-qty-minus="${index}">−</button>
          <span>${item.qty}</span>
          <button data-qty-plus="${index}">+</button>
        </div>
        <div class="cart-row__price">${formatPrice(lineTotal)}</div>
      </div>
    `;
  }).join("");

  container.querySelectorAll("[data-remove]").forEach(el => {
    el.addEventListener("click", () => removeFromCart(parseInt(el.getAttribute("data-remove"))));
  });
  container.querySelectorAll("[data-qty-minus]").forEach(el => {
    el.addEventListener("click", () => updateQty(parseInt(el.getAttribute("data-qty-minus")), -1));
  });
  container.querySelectorAll("[data-qty-plus]").forEach(el => {
    el.addEventListener("click", () => updateQty(parseInt(el.getAttribute("data-qty-plus")), 1));
  });
  container.querySelectorAll("[data-select]").forEach(el => {
    el.addEventListener("change", () => toggleSelected(parseInt(el.getAttribute("data-select")), el.checked));
  });

  const totalEl = document.querySelector("[data-cart-total]");
  if(totalEl) totalEl.textContent = formatPrice(total);

  const savedNote = document.querySelector("[data-cart-saved-note]");
  if(savedNote){
    if(savedCount > 0){
      savedNote.style.display = "block";
      savedNote.textContent = `${savedCount} producto${savedCount === 1 ? "" : "s"} guardado${savedCount === 1 ? "" : "s"} para después (${formatPrice(savedTotal)}) — no se incluye en el total ni en el checkout.`;
    } else {
      savedNote.style.display = "none";
    }
  }

  const checkoutBtn = document.querySelector("[data-go-checkout]");
  if(checkoutBtn){
    const anySelected = cart.some(isSelected);
    checkoutBtn.classList.toggle("btn--disabled-look", !anySelected);
  }
}

// ---------- Checkout (simulado) ----------
// Solo entran los ítems marcados "comprar ahora"; lo guardado para después
// se queda tranquilo en el carrito.
function renderCheckoutSummary(){
  const container = document.querySelector("[data-checkout-summary]");
  const totalEl = document.querySelector("[data-checkout-total]");
  if(!container) return;
  const cart = getCart().filter(isSelected);
  let total = 0;
  if(cart.length === 0){
    container.innerHTML = `<p class="catalog-empty" style="padding:20px 0;">No tenés productos marcados para comprar ahora.</p>`;
  } else {
    container.innerHTML = cart.map(item => {
      const product = findAnyProduct(item.productId);
      if(!product) return "";
      const lineTotal = product.price * item.qty;
      total += lineTotal;
      return `<div class="order-summary__row"><span>${product.name} (${item.size}) x${item.qty}</span><span>${formatPrice(lineTotal)}</span></div>`;
    }).join("");

    const items = cart.map(item => {
      const product = findAnyProduct(item.productId);
      return product ? productToGaItem(product, { item_variant: item.size, quantity: item.qty }) : null;
    }).filter(Boolean);
    gaEvent("begin_checkout", { currency: "ARS", value: total, items });
  }
  if(totalEl) totalEl.textContent = formatPrice(total);
}

// Alias para transferencia — cambiar acá cuando tengamos el definitivo.
const STORE_ALIAS = "alias.pendiente.definir";

// Confirma el pedido: saca del carrito solo lo comprado, muestra el alias.
function finalizeCheckout(){
  const cart = getCart();
  const purchased = cart.filter(isSelected);
  const remaining = cart.filter(item => !isSelected(item));
  localStorage.setItem(CART_KEY, JSON.stringify(remaining));

  if(purchased.length > 0){
    let value = 0;
    const items = purchased.map(item => {
      const product = findAnyProduct(item.productId);
      if(!product) return null;
      value += (product.price || 0) * item.qty;
      return productToGaItem(product, { item_variant: item.size, quantity: item.qty });
    }).filter(Boolean);
    gaEvent("purchase", {
      transaction_id: `floater-${Date.now()}`,
      currency: "ARS",
      value,
      items
    });
  }

  const aliasEl = document.querySelector("[data-checkout-alias]");
  if(aliasEl) aliasEl.textContent = STORE_ALIAS;
  document.querySelector("[data-checkout-form-wrap]").style.display = "none";
  document.querySelector("[data-checkout-confirm]").style.display = "block";
  const alert = document.querySelector("[data-addr-alert]");
  if(alert) alert.classList.remove("is-open");
}

// Verifica la dirección contra un servicio real de geocoding (OpenStreetMap /
// Nominatim, gratis, sin API key). Si no encuentra nada, no bloquea la compra:
// muestra la alerta y deja seguir igual. Si el servicio falla o tarda, también
// deja pasar — la idea es que comprar sea rápido, no que dependa de un tercero.
async function verifyAddress(addressText){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try{
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ar&q=${encodeURIComponent(addressText)}`;
    const res = await fetch(url, { signal: controller.signal, headers: { "Accept": "application/json" } });
    clearTimeout(timeout);
    if(!res.ok) return true; // el servicio falló, no trabamos la compra
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch(err){
    clearTimeout(timeout);
    return true; // timeout / sin conexión al servicio de verificación: dejamos pasar
  }
}

function initCheckoutForm(){
  const form = document.querySelector("[data-checkout-form]");
  if(!form) return;
  const submitBtn = document.querySelector("[data-checkout-submit]");
  const alert = document.querySelector("[data-addr-alert]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const addressInput = document.querySelector("[data-field-address]");
    const cityInput = document.querySelector("[data-field-city]");
    const zipInput = document.querySelector("[data-field-zip]");
    const addressText = [addressInput?.value, cityInput?.value, zipInput?.value, "Argentina"]
      .filter(Boolean).join(", ");

    if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = "Verificando dirección…"; }

    const found = await verifyAddress(addressText);

    if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = "Confirmar pedido"; }

    if(found){
      finalizeCheckout();
    } else if(alert){
      alert.classList.add("is-open");
    } else {
      // sin modal disponible por algún motivo: no trabamos la compra
      finalizeCheckout();
    }
  });

  if(alert){
    const useAnyway = alert.querySelector("[data-addr-use-anyway]");
    const edit = alert.querySelector("[data-addr-edit]");
    if(useAnyway) useAnyway.addEventListener("click", () => finalizeCheckout());
    if(edit) edit.addEventListener("click", () => {
      alert.classList.remove("is-open");
      document.querySelector("[data-field-address]")?.focus();
    });
  }
}

// ---------- Alta a lista de acceso exclusivo (simulado) ----------
function initSignupForm(){
  const form = document.querySelector("[data-signup-form]");
  if(!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.querySelector("[data-signup-form-wrap]").style.display = "none";
    document.querySelector("[data-signup-confirm]").style.display = "block";
  });
}

// ---------- Init por página ----------
document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initCartDrawer();
  initSiteNavigation();
  initQuickAdd();
  initLandingBgLoop();
  renderCatalogList("[data-catalog-list]");
  renderHomeFeatured();
  renderNewestByCategory("[data-newest-list]");
  renderOffers("[data-offers-list]");
  renderProductPage();
  renderDropPage();
  renderCartPage();
  renderCheckoutSummary();
  initCheckoutForm();
  initSignupForm();
  // Va al final: tiene que correr DESPUÉS de que el catálogo ya esté
  // en el DOM, si no los productos (que tienen la clase .reveal) quedan
  // con opacity:0 para siempre porque el observer nunca llegó a verlos.
  initScrollReveal();
});
