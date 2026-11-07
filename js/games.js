/* ============ Scratch Day · jogos e efeitos ============ */
(function () {
  const G = (window.Games = {});

  /* ---------- confete ---------- */
  G.confetti = function (amount) {
    const cv = document.getElementById("confetti");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#4C97FF", "#9966FF", "#CF63CF", "#FFBF00", "#FFAB19", "#5CB1D6", "#59C059", "#FF8C1A", "#FF6680"];
    const n = amount || 160;
    const parts = [];
    for (let i = 0; i < n; i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.4,
        y: innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 15 - 4,
        w: 7 + Math.random() * 7, h: 5 + Math.random() * 6,
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        c: colors[(Math.random() * colors.length) | 0]
      });
    }
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.vy += 0.42; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      if (t - t0 < 3200) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  };

  /* ---------- som curtinho ---------- */
  let actx;
  G.beep = function (kind) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = kind === "bad" ? [220, 180] : kind === "win" ? [523, 659, 784, 1047] : [660, 880];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = kind === "bad" ? "square" : "triangle";
        o.frequency.value = f;
        const t = actx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.2);
      });
    } catch (e) { /* sem som, tudo bem */ }
  };

  /* ---------- receita embaralhada ---------- */
  G.initRecipe = function () {
    const list = document.getElementById("recipe");
    if (!list) return;
    const original = [...list.children].map((li) => li.textContent);
    const msg = document.getElementById("recipeMsg");
    const silly = ["Hmm… escovar sem pasta? 🤨", "Guardar a escova antes de usar? 😂", "Que bagunça! O resultado mudou. 🙃", "Ops! O computador faria exatamente isso. 🤖"];
    function render(arr) { list.innerHTML = arr.map((t) => "<li>" + t + "</li>").join(""); }
    document.getElementById("recipeShuffle").onclick = () => {
      let arr;
      do { arr = original.slice().sort(() => Math.random() - 0.5); } while (arr.join() === original.join());
      render(arr);
      msg.textContent = silly[(Math.random() * silly.length) | 0];
      msg.style.color = "#e04a64";
    };
    document.getElementById("recipeFix").onclick = () => {
      render(original); msg.textContent = "Tudo certo! 😁"; msg.style.color = "";
    };
  };

  /* ---------- programe o robô ---------- */
  const LEVELS = [
    { start: [0, 2], goal: [4, 2], rocks: [] },
    { start: [0, 4], goal: [4, 0], rocks: [[2, 4], [2, 3], [2, 2]] },
    { start: [0, 0], goal: [4, 4], rocks: [[1, 0], [1, 1], [1, 2], [3, 2], [3, 3], [3, 4]] }
  ];
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const LABEL = { up: "↑ suba 1", down: "↓ desça 1", left: "← vá 1 p/ esquerda", right: "→ vá 1 p/ direita" };
  const MAX = 16;

  G.initRobot = function (opts) {
    const board = document.getElementById("robotBoard");
    if (!board) return;
    const progEl = document.getElementById("robotProgram");
    const msg = document.getElementById("robotMsg");
    const tag = document.getElementById("robotLevelTag");
    let level = Math.min(opts.getLevel() || 0, LEVELS.length - 1);
    let prog = [];
    let running = false;
    let robot, pos;

    function cellAt(x, y) { return board.children[y * 5 + x]; }
    function place(x, y) {
      robot.style.transform = "translate(calc(" + x + " * (100% + 6px)), calc(" + y + " * (100% + 6px)))";
    }
    function build() {
      const L = LEVELS[level];
      board.innerHTML = "";
      for (let i = 0; i < 25; i++) board.appendChild(Object.assign(document.createElement("div"), { className: "cell" }));
      L.rocks.forEach(([x, y]) => cellAt(x, y).classList.add("rock"));
      cellAt(L.goal[0], L.goal[1]).classList.add("goal");
      robot = document.createElement("div");
      robot.className = "robot";
      robot.innerHTML = '<svg style="color:var(--bit)"><use href="#bit"/></svg>';
      board.appendChild(robot);
      pos = L.start.slice();
      robot.style.transition = "none"; place(pos[0], pos[1]);
      robot.offsetWidth; robot.style.transition = "";
      tag.textContent = "Fase " + (level + 1) + " de " + LEVELS.length;
      prog = []; renderProg();
      msg.textContent = level === 0 ? "Dica: comece apertando um comando azul." : "Nova fase! Cuidado com as pedras.";
      msg.style.color = "";
    }
    function renderProg(active) {
      progEl.innerHTML = prog.map((c, i) => '<li class="' + (i === active ? "running" : "") + '">' + LABEL[c] + "</li>").join("");
      const li = active != null && progEl.children[active];
      if (li) { const box = progEl.parentElement; box.scrollTop = Math.max(0, li.offsetTop - box.clientHeight / 2); }
    }
    function say(t, color) { msg.textContent = t; msg.style.color = color || ""; }

    document.querySelectorAll(".cmd").forEach((b) => {
      b.onclick = () => {
        if (running) return;
        if (prog.length >= MAX) return say("Programa muito comprido! Tente com menos comandos.", "#e04a64");
        prog.push(b.dataset.cmd); renderProg(); say("");
      };
    });
    document.getElementById("robotUndo").onclick = () => { if (!running) { prog.pop(); renderProg(); } };
    document.getElementById("robotClear").onclick = () => { if (!running) { prog = []; renderProg(); resetPos(); say(""); } };
    function resetPos() {
      pos = LEVELS[level].start.slice(); place(pos[0], pos[1]);
    }
    document.getElementById("robotRun").onclick = async () => {
      if (running) return;
      if (!prog.length) return say("O programa está vazio! Adicione comandos. 🙂", "#e04a64");
      running = true; resetPos();
      robot.classList.remove("shake", "win");
      await wait(350);
      const L = LEVELS[level];
      for (let i = 0; i < prog.length; i++) {
        renderProg(i);
        const [dx, dy] = DIRS[prog[i]];
        const nx = pos[0] + dx, ny = pos[1] + dy;
        const out = nx < 0 || ny < 0 || nx > 4 || ny > 4;
        const rock = L.rocks.some(([x, y]) => x === nx && y === ny);
        if (out || rock) {
          robot.classList.add("shake"); G.beep("bad");
          say(out ? "Ops! O Bit ia sair do tabuleiro. Conserte o bug! 🐛" : "Pedra no caminho! Mude o programa. 🪨", "#e04a64");
          await wait(500); robot.classList.remove("shake");
          running = false; renderProg(); return;
        }
        pos = [nx, ny]; place(nx, ny);
        await wait(420);
      }
      renderProg();
      if (pos[0] === L.goal[0] && pos[1] === L.goal[1]) {
        robot.classList.add("win"); G.beep("win");
        if (level < LEVELS.length - 1) {
          say("Isso! Você programou o robô! ⭐ Indo para a próxima fase…", "#2e8b2e");
          await wait(1600);
          level++; opts.setLevel(level); build();
        } else {
          say("Você completou todas as fases! 🏆", "#2e8b2e");
          opts.onWin();
        }
      } else {
        say("Quase! O Bit parou longe da estrela. Tente de novo.", "#e04a64");
        G.beep("bad");
      }
      running = false;
    };
    G.robotRestart = () => { level = 0; opts.setLevel(0); build(); };
    build();
  };
  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  /* ---------- Pong de demonstração ---------- */
  G.initPong = function () {
    const cv = document.getElementById("pongDemo");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = 480, H = 360;
    const startBtn = document.getElementById("pongStart");
    let ball, pad, score, raf, running = false, keys = {};
    G.pongActive = () => running;

    function reset() {
      const ang = (Math.random() * 120 - 60) * Math.PI / 180; // direção como no Scratch: 0 = para cima
      ball = { x: W / 2, y: 120, r: 11, vx: Math.sin(ang) * 5, vy: -Math.cos(ang) * 5 };
      pad = { x: W / 2, w: 96, h: 14, y: H - 34 };
      score = 0;
    }
    function draw(over) {
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#ffd1da"; ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, H - 12); ctx.lineTo(W, H - 12); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#e3242b";
      roundRect(pad.x - pad.w / 2, pad.y, pad.w, pad.h, 4);
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
      // placar estilo variável do Scratch
      ctx.fillStyle = "#e9eef2"; roundRect(8, 8, 104, 28, 6);
      ctx.fillStyle = "#575e75"; ctx.font = "bold 14px Nunito, sans-serif"; ctx.fillText("pontos", 16, 27);
      ctx.fillStyle = "#FF8C1A"; roundRect(70, 12, 36, 20, 10);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(String(score), 88, 27); ctx.textAlign = "left";
      if (over) {
        ctx.fillStyle = "rgba(42,36,64,.55)"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center";
        ctx.font = "bold 40px Fredoka, Nunito, sans-serif"; ctx.fillText("Fim de jogo!", W / 2, H / 2 - 50);
        ctx.font = "bold 20px Nunito, sans-serif"; ctx.fillText("Você fez " + score + (score === 1 ? " ponto" : " pontos"), W / 2, H / 2 - 18);
        ctx.textAlign = "left";
      }
    }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
    }
    function step() {
      if (keys.ArrowLeft) pad.x -= 9;
      if (keys.ArrowRight) pad.x += 9;
      pad.x = Math.max(pad.w / 2, Math.min(W - pad.w / 2, pad.x));
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x < ball.r) { ball.x = ball.r; ball.vx *= -1; }
      if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx *= -1; }
      if (ball.y < ball.r) { ball.y = ball.r; ball.vy *= -1; }
      if (ball.vy > 0 && ball.y + ball.r >= pad.y && ball.y + ball.r <= pad.y + pad.h + 8 &&
          ball.x > pad.x - pad.w / 2 - ball.r && ball.x < pad.x + pad.w / 2 + ball.r) {
        score++;
        const sp = Math.min(5 + score * 0.35, 11);
        const ang = (Math.random() * 120 - 60) * Math.PI / 180;
        ball.vx = Math.sin(ang) * sp; ball.vy = -Math.cos(ang) * sp;
        ball.y = pad.y - ball.r;
        G.beep();
      }
      if (ball.y > H + ball.r) { stop(true); return; }
      draw(false);
      raf = requestAnimationFrame(step);
    }
    function start() {
      reset(); running = true; startBtn.hidden = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(step);
    }
    function stop(over) {
      running = false; cancelAnimationFrame(raf);
      if (over) { draw(true); G.beep("bad"); startBtn.textContent = "↻ Jogar de novo"; }
      startBtn.hidden = false;
    }
    G.pongStop = () => { if (running) { stop(false); draw(false); startBtn.textContent = "▶ Jogar"; } };
    startBtn.onclick = start;
    cv.addEventListener("mousemove", (e) => {
      const r = cv.getBoundingClientRect();
      pad.x = ((e.clientX - r.left) / r.width) * W;
    });
    cv.addEventListener("touchmove", (e) => {
      const r = cv.getBoundingClientRect();
      pad.x = ((e.touches[0].clientX - r.left) / r.width) * W; e.preventDefault();
    }, { passive: false });
    addEventListener("keydown", (e) => { if (running && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { keys[e.key] = true; e.preventDefault(); } });
    addEventListener("keyup", (e) => { keys[e.key] = false; });
    reset(); draw(false);
  };

  /* ---------- bússola de direções ---------- */
  G.initDial = function () {
    const arrow = document.getElementById("dialArrow");
    if (!arrow) return;
    const out = document.getElementById("dialValue");
    const range = document.getElementById("dialRange");
    // setor de -75 a 75 (0 = cima)
    const toXY = (deg, r) => [Math.sin(deg * Math.PI / 180) * r, -Math.cos(deg * Math.PI / 180) * r];
    const [ax, ay] = toXY(-75, 100), [bx, by] = toXY(75, 100);
    range.setAttribute("d", "M0 0 L" + ax + " " + ay + " A100 100 0 0 1 " + bx + " " + by + " Z");
    let cur = 90;
    arrow.style.transform = "rotate(90deg)";
    document.getElementById("dialRoll").onclick = () => {
      const v = Math.round(Math.random() * 150 - 75);
      // gira pelo caminho mais curto, com uma volta extra para dar emoção
      let target = v;
      while (target < cur + 360) target += 360;
      cur = target;
      arrow.style.transform = "rotate(" + cur + "deg)";
      out.textContent = "…";
      setTimeout(() => { out.textContent = v; G.beep(); }, 750);
    };
  };
})();
