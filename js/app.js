/* ============ Scratch Day · navegação e interações ============ */
(function () {
  const CFG = window.SCRATCH_DAY || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  /* ---------- estado salvo no navegador (por computador) ---------- */
  const KEY = "scratchday-v1";
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }
  state.badges = state.badges || {};
  state.checks = state.checks || {};
  state.chal = state.chal || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ok */ } }

  /* ---------- blocos do Scratch (scratchblocks, em português) ---------- */
  function blockSVG(code, scale) {
    const doc = scratchblocks.parse(code, { languages: ["en"] });
    if (scratchblocks.allLanguages && scratchblocks.allLanguages.pt_br) doc.translate(scratchblocks.allLanguages.pt_br);
    return scratchblocks.render(doc, { style: "scratch3", languages: ["pt_br"], scale: scale || 1 });
  }
  function renderBlocks() {
    if (!window.scratchblocks) return;
    $$("pre.blocks").forEach((pre) => {
      try {
        const div = document.createElement("div");
        div.className = "sb-out";
        div.appendChild(blockSVG(pre.textContent, parseFloat(pre.dataset.scale || "1")));
        pre.replaceWith(div);
      } catch (e) { console.error("scratchblocks", e); }
    });
  }

  /* ---------- configuração ---------- */
  function applyConfig() {
    $$("[data-cfg]").forEach((el) => {
      const v = CFG[el.dataset.cfg];
      if (v) el.textContent = v; else if (v === "") el.hidden = true;
    });
    document.title = (CFG.evento || "Scratch Day") + (CFG.local ? " · " + CFG.local.split("·")[0].trim() : "");
    // título da capa em "blocos" coloridos
    const colors = ["#4C97FF", "#9966FF", "#CF63CF", "#FFBF00", "#FFAB19", "#5CB1D6", "#59C059", "#FF8C1A", "#FF6680"];
    const t = $("#coverTitle");
    t.innerHTML = "";
    let ci = 0;
    [...(CFG.evento || "Scratch Day")].forEach((ch, i) => {
      if (ch === " ") { t.appendChild(Object.assign(document.createElement("span"), { className: "gap" })); return; }
      const s = document.createElement("span");
      s.className = "tile"; s.textContent = ch;
      s.style.background = colors[ci++ % colors.length];
      s.style.animationDelay = i * 0.06 + "s";
      t.appendChild(s);
    });
    $("#coverMeta").textContent = [CFG.data, CFG.local, CFG.organizacao].filter(Boolean).join(" · ");
    $("#certMeta").textContent = [CFG.evento, CFG.data, CFG.local].filter(Boolean).join(" · ");
    const team = $("#team");
    if (CFG.equipe && CFG.equipe.length) {
      const n = CFG.equipe;
      team.textContent = "Com carinho, " + (n.length > 1 ? n.slice(0, -1).join(", ") + " e " + n[n.length - 1] : n[0]) + (CFG.organizacao ? " · " + CFG.organizacao : "");
    } else team.textContent = CFG.organizacao ? "Com carinho, " + CFG.organizacao : "";
    if (CFG.scratchUrl) $("#openScratch").href = CFG.scratchUrl;
    // agenda
    const ag = $("#agenda");
    let total = 0;
    (CFG.agenda || []).forEach((a) => {
      total += a.min || 0;
      const li = document.createElement("li");
      li.innerHTML = '<span class="a-ico"></span><span class="a-t"></span><span class="a-min"></span>';
      li.children[0].textContent = a.icone || "•";
      li.children[1].textContent = a.titulo;
      li.children[2].textContent = a.min ? "≈ " + a.min + " min" : "";
      ag.appendChild(li);
    });
    if (total) {
      const h = Math.floor(total / 60), m = total % 60;
      const li = document.createElement("li");
      li.className = "a-total";
      li.innerHTML = '<span class="a-ico">⏱️</span><span>Total</span><span class="a-min"></span>';
      li.lastChild.textContent = "≈ " + (h ? h + "h" : "") + (m ? String(m).padStart(h ? 2 : 1, "0") + (h ? "" : " min") : "");
      ag.appendChild(li);
    }
    // intervalo
    if (CFG.mostrarIntervalo === false) $("#breakSlide").remove();
    else if (CFG.minutosIntervalo) $("#breakTimer").dataset.min = CFG.minutosIntervalo;
  }

  /* ---------- navegação ---------- */
  const SECTIONS = [
    ["abertura", "Início"], ["aquecimento", "Aquecimento"], ["scratch", "Scratch"], ["blocos", "Blocos"],
    ["m1", "Missão 1"], ["m2", "Missão 2"], ["pong", "Pong"], ["final", "Final"]
  ];
  let slides = [], cur = -1;

  function buildNav() {
    slides = $$(".slide");
    const nav = $("#sections");
    SECTIONS.forEach(([id, label]) => {
      const first = slides.findIndex((s) => s.dataset.section === id);
      if (first < 0) return;
      const b = document.createElement("button");
      b.className = "sec"; b.dataset.sec = id; b.textContent = label;
      b.onclick = () => go(first);
      nav.appendChild(b);
    });
    const list = $("#menuList");
    slides.forEach((s, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.textContent = s.dataset.title;
      b.onclick = () => { closeMenu(); go(i); };
      li.appendChild(b); list.appendChild(li);
    });
  }

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    const forward = i > cur;
    slides.forEach((s, k) => {
      s.classList.toggle("active", k === i);
      s.classList.toggle("back", k < i);
      if (k !== i) s.setAttribute("aria-hidden", "true"); else s.removeAttribute("aria-hidden");
    });
    const leaving = slides[cur];
    if (leaving && leaving.querySelector("#pongDemo") && window.Games.pongStop) Games.pongStop();
    cur = i;
    slides[i].scrollTop = 0;
    $("#stage").scrollLeft = 0;
    $("#prevBtn").disabled = i === 0;
    $("#nextBtn").disabled = i === slides.length - 1;
    $("#nextBtn").classList.toggle("pulse", i < 2);
    $("#counter").textContent = i + 1 + " / " + slides.length;
    $("#progressFill").style.width = (i / (slides.length - 1)) * 100 + "%";
    const sec = slides[i].dataset.section;
    const secIdx = SECTIONS.findIndex((s) => s[0] === sec);
    $$(".sec").forEach((b) => {
      const k = SECTIONS.findIndex((s) => s[0] === b.dataset.sec);
      b.classList.toggle("on", k === secIdx);
      b.classList.toggle("done", k < secIdx);
    });
    $$("#menuList li").forEach((li, k) => li.classList.toggle("cur", k === i));
    const h = "#/" + (i + 1);
    if (location.hash !== h) history.replaceState(null, "", h);
    if (slides[i].classList.contains("slide-cert")) setTimeout(() => Games.confetti(), 400);
    void forward;
  }
  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);

  function indexFromHash() {
    const m = /#\/(\d+)/.exec(location.hash);
    return m ? parseInt(m[1], 10) - 1 : 0;
  }

  /* ---------- menu / tela cheia ---------- */
  function openMenu() { $("#menu").hidden = false; }
  function closeMenu() { $("#menu").hidden = true; }
  function toggleFs() {
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    } catch (e) { /* ok */ }
  }

  /* ---------- toast + conquistas ---------- */
  const BADGES = {
    robo: ["🤖", "Programador de robôs"], quiz: ["🧠", "Expert em blocos"], m1: ["🐱", "Primeiro código"],
    bug: ["🐛", "Caçador de bugs"], m2: ["🎲", "Mestre do acaso"], pong: ["🏓", "Criador de jogos"], extra: ["🚀", "Turbinador"]
  };
  let toastT;
  function toast(t) {
    const el = $("#toast");
    el.textContent = t; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2800);
  }
  function award(key) {
    if (!BADGES[key] || state.badges[key]) return;
    state.badges[key] = Date.now(); save();
    toast("🏅 Nova conquista: " + BADGES[key][0] + " " + BADGES[key][1] + "!");
    Games.confetti(); Games.beep("win");
    renderBadges();
  }
  function renderBadges() {
    const keys = Object.keys(BADGES).filter((k) => state.badges[k]);
    $("#badgesMini").innerHTML = keys.map((k) => '<span title="' + BADGES[k][1] + '">' + BADGES[k][0] + "</span>").join("");
    $("#certBadges").innerHTML = keys.length
      ? keys.map((k) => "<span>" + BADGES[k][0] + " " + BADGES[k][1] + "</span>").join("")
      : "<span>🌟 Participação no Scratch Day</span>";
  }

  /* ---------- nome e cor ---------- */
  const BIT_COLORS = ["#4C97FF", "#9966FF", "#FF6680", "#59C059", "#FFAB19", "#5CB1D6", "#CF63CF", "#FF8C1A"];
  function applyName() {
    const n = (state.nome || "").trim();
    $("#hello").textContent = n ? "Oi, " + n + "! 👋" : "";
    $("#certName").textContent = n || "Você";
    const sp = $("#bitSpeech");
    sp.innerHTML = "";
    sp.append(n ? "Oi, " + n + "! " : "Oi! ", "Eu sou o ");
    sp.appendChild(Object.assign(document.createElement("b"), { textContent: "Bit" }));
    sp.append(", um robô ajudante. Vou te acompanhar hoje!");
  }
  function applyColor() {
    document.documentElement.style.setProperty("--bit", state.cor || BIT_COLORS[0]);
    $$(".swatch").forEach((s) => s.classList.toggle("on", s.dataset.c === (state.cor || BIT_COLORS[0])));
  }
  function initWelcome() {
    const inp = $("#nameInput");
    inp.value = state.nome || "";
    inp.addEventListener("input", () => { state.nome = inp.value; save(); applyName(); });
    const sw = $("#swatches");
    BIT_COLORS.forEach((c) => {
      const b = document.createElement("button");
      b.className = "swatch"; b.dataset.c = c; b.style.background = c; b.setAttribute("aria-label", "Cor " + c);
      b.onclick = () => { state.cor = c; save(); applyColor(); Games.beep(); };
      sw.appendChild(b);
    });
    applyName(); applyColor();
  }

  /* ---------- checklists ---------- */
  function initChecklists() {
    $$(".checklist").forEach((ul) => {
      const id = ul.dataset.badge;
      const done = new Set(state.checks[id] || []);
      const items = $$("li", ul);
      items.forEach((li, k) => {
        const txt = document.createElement("span");
        txt.className = "txt";
        while (li.firstChild) txt.appendChild(li.firstChild);
        li.appendChild(txt);
        li.insertAdjacentHTML("afterbegin", '<span class="box" aria-hidden="true"></span>');
        li.setAttribute("role", "checkbox");
        li.tabIndex = 0;
        const set = (on) => { li.classList.toggle("ok", on); li.setAttribute("aria-checked", on); };
        set(done.has(k));
        const toggle = () => {
          if (done.has(k)) done.delete(k); else { done.add(k); Games.beep(); }
          set(done.has(k));
          state.checks[id] = [...done]; save();
          if (done.size === items.length) {
            if (BADGES[id] && !state.badges[id]) award(id);
            else if (!BADGES[id]) { toast("✅ Etapa concluída! Mandou bem!"); Games.confetti(60); }
          }
        };
        li.addEventListener("click", toggle);
        li.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
      });
    });
  }

  /* ---------- cronômetros ---------- */
  function initTimers() {
    $$(".timer").forEach((el) => {
      const mins = parseFloat(el.dataset.min || "10");
      el.innerHTML = '<span class="t-ico">⏱️</span><span class="t-face"></span><div class="t-btns"><button class="t-go">▶ Iniciar</button><button class="t-reset" title="Recomeçar">↺</button></div>';
      const face = $(".t-face", el), go = $(".t-go", el);
      let left = mins * 60 * 1000, endAt = 0, iv = null;
      const fmt = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
      const paint = () => { face.textContent = fmt(iv ? endAt - Date.now() : left); };
      function tick() {
        const r = endAt - Date.now();
        if (r <= 0) {
          clearInterval(iv); iv = null; left = 0; paint();
          el.classList.remove("running"); el.classList.add("ended"); go.textContent = "▶ Iniciar";
          Games.beep("win");
          return;
        }
        paint();
      }
      go.onclick = () => {
        if (iv) { left = endAt - Date.now(); clearInterval(iv); iv = null; go.textContent = "▶ Continuar"; el.classList.remove("running"); paint(); return; }
        if (left <= 0) left = mins * 60 * 1000;
        el.classList.remove("ended");
        endAt = Date.now() + left; iv = setInterval(tick, 250); go.textContent = "⏸ Pausar"; el.classList.add("running"); paint();
      };
      $(".t-reset", el).onclick = () => { clearInterval(iv); iv = null; left = mins * 60 * 1000; go.textContent = "▶ Iniciar"; el.classList.remove("running", "ended"); paint(); };
      paint();
    });
  }

  /* ---------- respostas e abas ---------- */
  function initReveals() {
    $$(".reveal").forEach((r) => {
      const btn = $(".reveal-btn", r);
      const label = btn.textContent;
      btn.onclick = () => {
        r.classList.toggle("open");
        btn.textContent = r.classList.contains("open") ? "🙈 Esconder" : label;
      };
    });
    $$(".tabs").forEach((tabs) => {
      const panes = $$(":scope > .tab-pane", tabs.parentElement);
      $$("button", tabs).forEach((b, k) => {
        b.onclick = () => {
          $$("button", tabs).forEach((x, j) => x.classList.toggle("on", j === k));
          panes.forEach((p, j) => p.classList.toggle("on", j === k));
        };
      });
    });
    const show = state.showAnswers != null ? state.showAnswers : CFG.mostrarRespostas !== false;
    const tg = $("#answersToggle");
    tg.checked = show;
    document.body.classList.toggle("no-answers", !show);
    tg.onchange = () => { state.showAnswers = tg.checked; save(); document.body.classList.toggle("no-answers", !tg.checked); };
  }

  /* ---------- interface do Scratch ---------- */
  const SPOTS = [
    { t: "Barra de menus", d: "Em Configurações você troca o idioma. Em Arquivo você salva o seu projeto no computador.", r: [5.6, 0, 33, 5.4] },
    { t: "Abas", d: "Código, Fantasias e Sons. Na aba Código a gente programa; na aba Fantasias a gente desenha.", r: [0.2, 5.6, 16.2, 5] },
    { t: "Categorias", d: "Cada bolinha colorida é uma família de blocos. Clique nela para pular até esses blocos.", r: [0, 10.6, 3.4, 44.5] },
    { t: "Blocos", d: "Aqui ficam todos os blocos. Arraste o bloco que você quer para a área de código.", r: [3.4, 10.6, 13.2, 89] },
    { t: "Área de código", d: "É aqui que você monta o programa, encaixando um bloco no outro. Para apagar, arraste o bloco de volta para a esquerda.", r: [16.8, 10.6, 56.8, 89] },
    { t: "Começar e parar", d: "A bandeira verde começa o programa. O botão vermelho para tudo.", r: [73.6, 5.4, 4.6, 5] },
    { t: "Palco", d: "Onde o seu jogo aparece. O meio do palco é x: 0 e y: 0.", r: [73.8, 10.2, 25.8, 39.4] },
    { t: "Informações do ator", d: "Nome do ator, posição (x e y), tamanho e direção. Dá para mudar tudo aqui.", r: [74, 50.4, 21.4, 11] },
    { t: "Atores", d: "Todos os personagens do projeto. Clique em um para ver o código dele. O botão com o gatinho e o + cria atores novos.", r: [74, 61.6, 21.4, 38] },
    { t: "Cenários", d: "Aqui você escolhe o fundo do palco.", r: [95.6, 50.4, 4.2, 49.4] }
  ];
  function initInterface() {
    const box = $("#ifaceImg");
    if (!box) return;
    const hl = $("#ifaceHl");
    let k = 0;
    SPOTS.forEach((s, i) => {
      const p = document.createElement("button");
      p.className = "pin"; p.textContent = i + 1;
      p.style.left = s.r[0] + s.r[2] / 2 + "%";
      p.style.top = Math.max(3, s.r[1] + Math.min(s.r[3] / 2, 8)) + "%";
      p.setAttribute("aria-label", s.t);
      p.onclick = () => sel(i);
      box.appendChild(p);
    });
    function sel(i) {
      k = (i + SPOTS.length) % SPOTS.length;
      const s = SPOTS[k];
      Object.assign(hl.style, { left: s.r[0] + "%", top: s.r[1] + "%", width: s.r[2] + "%", height: s.r[3] + "%" });
      $("#ifaceNum").textContent = k + 1;
      $("#ifaceTitle").textContent = s.t;
      $("#ifaceText").textContent = s.d;
      $$(".pin", box).forEach((p, j) => p.classList.toggle("on", j === k));
    }
    $("#ifaceNext").onclick = () => sel(k + 1);
    $("#ifacePrev").onclick = () => sel(k - 1);
    sel(0);
  }

  /* ---------- categorias ---------- */
  function initCats() {
    const btns = $$("#catList button");
    const show = (id) => {
      btns.forEach((b) => b.classList.toggle("on", b.dataset.cat === id));
      $$(".cat-panel").forEach((p) => p.classList.toggle("on", p.dataset.cat === id));
    };
    btns.forEach((b) => (b.onclick = () => show(b.dataset.cat)));
    show("movimento");
  }

  /* ---------- quiz ---------- */
  const CATS = {
    Movimento: "#4C97FF", Aparência: "#9966FF", Som: "#CF63CF", Eventos: "#FFBF00",
    Controle: "#FFAB19", Sensores: "#5CB1D6", Operadores: "#59C059", Variáveis: "#FF8C1A"
  };
  const QUIZ = [
    ["move (10) steps", "Movimento", ["Eventos", "Aparência", "Operadores"]],
    ["when flag clicked", "Eventos", ["Movimento", "Controle", "Som"]],
    ["forever\nend", "Controle", ["Eventos", "Sensores", "Variáveis"]],
    ["(pick random (1) to (10))", "Operadores", ["Controle", "Movimento", "Sensores"]],
    ["<touching (borda v)?>", "Sensores", ["Operadores", "Movimento", "Aparência"]],
    ["say [Olá!] for (2) seconds", "Aparência", ["Som", "Eventos", "Movimento"]]
  ];
  function initQuiz() {
    let q = 0, score = 0;
    const blk = $("#quizBlock"), opts = $("#quizOptions"), msg = $("#quizMsg");
    function show() {
      if (q >= QUIZ.length) return end();
      const [code, ans, wrong] = QUIZ[q];
      $("#quizCount").textContent = "Pergunta " + (q + 1) + " de " + QUIZ.length;
      $("#quizScore").textContent = "⭐ " + score;
      blk.innerHTML = "";
      try { blk.appendChild(blockSVG(code, 1.4)); } catch (e) { blk.textContent = code; }
      opts.innerHTML = ""; msg.textContent = "";
      let firstTry = true;
      [ans, ...wrong].sort(() => Math.random() - 0.5).forEach((c) => {
        const b = document.createElement("button");
        b.textContent = c; b.style.setProperty("--c", CATS[c]);
        b.onclick = () => {
          if (c === ans) {
            if (firstTry) score++;
            b.classList.add("right"); $$("button", opts).forEach((x) => (x.disabled = true));
            msg.textContent = ["Acertou! 🎉", "Isso aí! ✨", "Mandou bem! 💪"][q % 3];
            msg.style.color = "#2e8b2e"; Games.beep();
            setTimeout(() => { q++; show(); }, 1100);
          } else {
            firstTry = false; b.disabled = true;
            msg.textContent = "Quase! Olhe a cor do bloco 👀"; msg.style.color = "#e04a64"; Games.beep("bad");
          }
        };
        opts.appendChild(b);
      });
    }
    function end() {
      $("#quizCount").textContent = "Fim do quiz!";
      $("#quizScore").textContent = "⭐ " + score;
      blk.innerHTML = '<div class="quiz-end">Você acertou <b>' + score + " de " + QUIZ.length + "</b> de primeira! " + (score >= 5 ? "🏆" : "👏") + "</div>";
      opts.innerHTML = "";
      const again = document.createElement("button");
      again.className = "btn btn-ghost"; again.textContent = "↺ Jogar de novo"; again.style.gridColumn = "1/-1";
      again.onclick = () => { q = 0; score = 0; show(); };
      opts.appendChild(again);
      msg.textContent = "";
      award("quiz");
    }
    show();
  }

  /* ---------- caça ao bug ---------- */
  function initBug() {
    const box = $("#bugQuiz");
    if (!box) return;
    const msg = $("#bugMsg");
    $$("button", box).forEach((b) => {
      b.onclick = () => {
        if (b.dataset.ok === "1") {
          b.classList.add("right");
          msg.innerHTML = "Isso! 🐛✅ O conserto: tire o <i>aponte para a direção</i> de dentro do <i>sempre</i> e coloque antes dele.";
          msg.style.color = "#2e8b2e";
          award("bug");
        } else {
          b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong");
          msg.textContent = "Não é isso. Olhe o que fica dentro do sempre! 🔍"; msg.style.color = "#e04a64";
          Games.beep("bad");
        }
      };
    });
  }

  /* ---------- desafios extras ---------- */
  function initChallenges() {
    $$("#challenges input[data-chal]").forEach((c) => {
      c.checked = !!state.chal[c.dataset.chal];
      c.onchange = () => {
        state.chal[c.dataset.chal] = c.checked; save();
        if (c.checked) { Games.beep(); if (!state.badges.extra) award("extra"); else Games.confetti(60); }
      };
    });
  }

  /* ---------- reiniciar para o próximo aluno ---------- */
  function initReset() {
    const b = $("#resetBtn");
    const label = b.textContent;
    let armed = false, t;
    b.onclick = () => {
      if (!armed) { armed = true; b.textContent = "⚠️ Tem certeza? Clique de novo para apagar"; t = setTimeout(() => { armed = false; b.textContent = label; }, 4000); return; }
      clearTimeout(t);
      try { localStorage.removeItem(KEY); } catch (e) { /* ok */ }
      location.hash = "#/1"; location.reload();
    };
  }

  /* ---------- teclado ---------- */
  function initKeys() {
    addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (!$("#menu").hidden) { if (e.key === "Escape") closeMenu(); return; }
      if (Games.pongActive && Games.pongActive() && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(slides.length - 1);
      else if (e.key === "f" || e.key === "F") toggleFs();
      else if (e.key === "m" || e.key === "M") openMenu();
    });
  }

  /* ---------- início ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyConfig();
    renderBlocks();
    buildNav();
    initWelcome();
    initChecklists();
    initTimers();
    initReveals();
    initInterface();
    initCats();
    initQuiz();
    initBug();
    initChallenges();
    initReset();
    initKeys();
    renderBadges();
    Games.initRecipe();
    Games.initRobot({ getLevel: () => state.robo || 0, setLevel: (l) => { state.robo = l; save(); }, onWin: () => award("robo") });
    Games.initPong();
    Games.initDial();

    $("#nextBtn").onclick = next;
    $("#prevBtn").onclick = prev;
    $$("[data-next]").forEach((b) => (b.onclick = next));
    $("#counter").onclick = openMenu;
    $("#menuBtn").onclick = openMenu;
    $("#menuClose").onclick = closeMenu;
    $("#menu").addEventListener("click", (e) => { if (e.target.id === "menu") closeMenu(); });
    $("#fsBtn").onclick = toggleFs;
    $("#confettiBtn").onclick = () => { Games.confetti(); Games.beep("win"); };
    addEventListener("hashchange", () => go(indexFromHash()));
    go(indexFromHash());
  });
})();
