/* =========================================================
   CONFIGURAÇÃO DO SCRATCH DAY
   Edite este arquivo para personalizar o evento.
   Não precisa mexer em mais nada para trocar textos básicos.
   ========================================================= */
window.SCRATCH_DAY = {
  // Nome que aparece na capa
  evento: "Scratch Day",

  // Linha de baixo da capa (deixe "" para esconder)
  subtitulo: "Aula introdutória de programação com Scratch",

  // Data e local (deixe "" para esconder)
  data: "",
  local: "UFPR · Curitiba",

  // Quem organiza (aparece na capa e no final)
  organizacao: "Equipe Scratch Day UFPR",

  // Nomes da equipe (aparecem na tela final). Ex.: ["Ana", "Bruno", "Carla"]
  equipe: [],

  // Link do editor do Scratch (abre em nova aba)
  scratchUrl: "https://scratch.mit.edu/projects/editor/",

  // Mostrar o botão "Ver uma possível resposta" nas missões?
  // Coloque false se quiser que só o professor mostre as respostas.
  mostrarRespostas: true,

  // Mostrar a tela de intervalo? E quantos minutos?
  mostrarIntervalo: true,
  minutosIntervalo: 10,

  // Roteiro da aula (aparece na tela "O que vamos fazer hoje")
  // min = duração aproximada em minutos
  agenda: [
    { icone: "👋", titulo: "Boas-vindas", min: 10 },
    { icone: "🤖", titulo: "Aquecimento: programe o robô", min: 10 },
    { icone: "🧭", titulo: "Conhecendo o Scratch", min: 15 },
    { icone: "🧩", titulo: "Os blocos", min: 15 },
    { icone: "🐱", titulo: "Missão 1: primeiro código", min: 15 },
    { icone: "🎲", titulo: "Missão 2: sorteios e sensores", min: 15 },
    { icone: "🍪", titulo: "Intervalo", min: 10 },
    { icone: "🏓", titulo: "Missão 3: jogo Pong", min: 30 },
    { icone: "🏆", titulo: "Desafios e encerramento", min: 10 }
  ]
};
