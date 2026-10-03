const PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 44">
  <path d="M17 0C7.6 0 0 7.6 0 17c0 12.3 17 27 17 27s17-14.7 17-27C34 7.6 26.4 0 17 0z"
        fill="#0d0d0d" stroke="#c59b27" stroke-width="1.2"/>
  <circle cx="17" cy="17" r="11" fill="#0d0d0d" stroke="#c59b27" stroke-width="1.4"/>
</svg>`;

const pinIcon = L.divIcon({
  className: "parceiro-pin-wrapper",
  html: `<div class="parceiro-pin">${PIN_SVG}<div class="pin-logo"></div></div>`,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
});

const ZOOM_FOCO = 15;

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function normalizar(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function popupHtml(p) {
  const foto = p.foto
    ? `<img class="foto" src="${escapeHtml(p.foto)}" alt="${escapeHtml(p.nome)}">`
    : "";
  const empresa = p.empresa ? `<div class="empresa">${escapeHtml(p.empresa)}</div>` : "";
  const creci = p.creci ? `<div class="campo"><strong>CRECI:</strong> ${escapeHtml(p.creci)}</div>` : "";
  const telefone = p.telefone
    ? `<div class="campo"><strong>Tel:</strong> <a href="tel:${escapeHtml(p.telefone.replace(/\D/g, ""))}">${escapeHtml(p.telefone)}</a></div>`
    : "";
  const email = p.email
    ? `<div class="campo"><strong>E-mail:</strong> <a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></div>`
    : "";
  const endereco = p.endereco ? `<div class="campo">${escapeHtml(p.endereco)}</div>` : "";
  const avisoPrecisao = p.endereco_precisao === "cidade"
    ? `<div class="campo" style="color:#a15c00; font-size:0.8rem;">📍 localização aproximada (centro da cidade)</div>`
    : "";

  const links = [];
  if (p.site) links.push(`<a class="site" href="${escapeHtml(p.site)}" target="_blank" rel="noopener">Site</a>`);
  if (p.instagram) links.push(`<a class="instagram" href="${escapeHtml(p.instagram)}" target="_blank" rel="noopener">Instagram</a>`);

  return `
    <div class="popup-parceiro">
      ${foto}
      <h3>${escapeHtml(p.nome)}</h3>
      ${empresa}
      ${endereco}
      ${avisoPrecisao}
      ${creci}
      ${telefone}
      ${email}
      ${links.length ? `<div class="links">${links.join("")}</div>` : ""}
    </div>
  `;
}

function itemListaHtml(p) {
  const foto = p.foto ? escapeHtml(p.foto) : "";
  const empresa = p.empresa ? `<div class="empresa">${escapeHtml(p.empresa)}</div>` : "";
  return `
    <img src="${foto}" alt="">
    <div class="info">
      <div class="nome">${escapeHtml(p.nome)}</div>
      ${empresa}
    </div>
  `;
}

async function init() {
  const map = L.map("map", { zoomControl: true });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  const res = await fetch("data/parceiros.json");
  const parceiros = await res.json();

  const markersPorId = {};
  const bounds = [];

  for (const p of parceiros) {
    if (typeof p.lat !== "number" || typeof p.lon !== "number") continue;

    const marker = L.marker([p.lat, p.lon], { icon: pinIcon }).addTo(map);
    marker.bindPopup(popupHtml(p), { minWidth: 220, maxWidth: 220 });

    // a largura do popup é calculada antes da foto carregar; recalcula ao carregar
    marker.on("popupopen", (e) => {
      const img = e.popup._contentNode.querySelector("img.foto");
      if (img && !img.complete) {
        img.addEventListener("load", () => e.popup.update());
      }
    });

    markersPorId[p.id] = marker;
    bounds.push([p.lat, p.lon]);
  }

  document.getElementById("contador").textContent = `${bounds.length} parceiros`;

  function verTodos() {
    if (bounds.length) {
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      map.setView([-14.235, -51.9253], 4);
    }
  }

  verTodos();

  const BotaoReset = L.Control.extend({
    options: { position: "topright" },
    onAdd() {
      const btn = L.DomUtil.create("button", "botao-reset");
      btn.type = "button";
      btn.textContent = "⤢ Ver todos";
      btn.title = "Centralizar mapa em todos os parceiros";
      L.DomEvent.disableClickPropagation(btn);
      btn.addEventListener("click", () => {
        verTodos();
        map.closePopup();
        listaEl.querySelectorAll("li.ativo").forEach((el) => el.classList.remove("ativo"));
      });
      return btn;
    },
  });
  map.addControl(new BotaoReset());

  // --- sidebar: lista + busca ---
  const listaEl = document.getElementById("lista-parceiros");
  const buscaInput = document.getElementById("busca-input");
  const buscaContador = document.getElementById("busca-contador");

  const parceirosComLocal = parceiros.filter((p) => markersPorId[p.id])
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR", { sensitivity: "base" }));

  function renderLista() {
    listaEl.innerHTML = "";
    for (const p of parceirosComLocal) {
      const li = document.createElement("li");
      li.dataset.id = p.id;
      li.dataset.busca = normalizar(`${p.nome} ${p.empresa || ""}`);
      li.innerHTML = itemListaHtml(p);
      li.addEventListener("click", () => selecionar(p.id));
      listaEl.appendChild(li);
    }
  }

  function selecionar(id) {
    const p = parceirosComLocal.find((x) => x.id === id);
    const marker = markersPorId[id];
    if (!p || !marker) return;

    map.flyTo([p.lat, p.lon], Math.max(map.getZoom(), ZOOM_FOCO), { duration: 0.8 });
    marker.openPopup();

    listaEl.querySelectorAll("li.ativo").forEach((el) => el.classList.remove("ativo"));
    const li = listaEl.querySelector(`li[data-id="${id}"]`);
    if (li) li.classList.add("ativo");
  }

  function filtrar() {
    const termo = normalizar(buscaInput.value.trim());
    let visiveis = 0;
    listaEl.querySelectorAll("li").forEach((li) => {
      const bate = !termo || li.dataset.busca.includes(termo);
      li.classList.toggle("oculto", !bate);
      if (bate) visiveis++;
    });
    buscaContador.textContent = termo
      ? `${visiveis} de ${parceirosComLocal.length} parceiros`
      : `${parceirosComLocal.length} parceiros`;
  }

  renderLista();
  filtrar();
  buscaInput.addEventListener("input", filtrar);

  const params = new URLSearchParams(location.search);
  const inicial = params.get("p");
  if (inicial && markersPorId[inicial]) selecionar(inicial);
}

init();
