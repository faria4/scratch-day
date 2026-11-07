# Scratch Day · UFPR

Plataforma interativa para a aula introdutória de Scratch (crianças de ~10 anos, cerca de 2 horas).
As telas avançam e voltam pelas setas, do primeiro bloco até o jogo **Pong**.

## Como usar no dia

1. Abra o site em cada computador (link do GitHub Pages).
2. Deixe na **capa** (`#/1`). Os alunos clicam em **Começar**.
3. O professor conduz: "cliquem em Avançar", "voltem uma tela" etc.
4. Atalhos: `←` `→` navegam, `F` tela cheia, `M` (ou clique no contador `7 / 30`) abre o **menu do professor**.
5. Para ir direto a uma tela, use o link com o número dela: `.../#/15` abre a Missão 1.

### Menu do professor (☰)
- Lista todas as telas para pular direto.
- **Mostrar botões de resposta**: liga/desliga o "Ver uma possível resposta" naquele computador.
- **Novo aluno**: apaga nome, cor e conquistas daquele computador (use entre uma turma e outra).

## Roteiro (30 telas)

| Parte | Telas |
|---|---|
| Início | Capa, boas-vindas (nome e cor do robô), roteiro, demo jogável do Pong, combinados |
| Aquecimento | O que é programar (instruções embaralhadas), **Programe o robô** (3 fases) |
| Scratch | O que é, abrir o Scratch, janelas lado a lado, **tela do Scratch** (pontos clicáveis), vocabulário |
| Blocos | Formatos dos blocos, famílias de cores (explorador), quiz relâmpago |
| Missão 1 | Gato anda e volta na borda (checklist + cronômetro), resposta, **caça ao bug** |
| Missão 2 | Sorteios/sensores (bússola de direções), direção aleatória, intervalo |
| Pong | Visão geral, desenhar atores, raquete, bola, fim de jogo, "deu problema?", desafios extras |
| Final | Salvar o jogo, certificado com o nome do aluno, agradecimento |

## Personalizar

Quase tudo fica em **`js/config.js`**: nome do evento, data, local, equipe, roteiro com tempos,
duração do intervalo, se as respostas aparecem e o link do Scratch.

Os textos das telas ficam em `index.html`, cada uma em um `<section class="slide">`.
Os blocos do Scratch são escritos em texto (sintaxe em inglês do [scratchblocks](https://scratchblocks.github.io/))
dentro de `<pre class="blocks">` e aparecem traduzidos para o português automaticamente.

## Rodar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Créditos

- Blocos renderizados com [scratchblocks](https://github.com/scratchblocks/scratchblocks) (MIT), incluído em `vendor/`.
- Scratch é um projeto do Scratch Foundation, em colaboração com o MIT Media Lab. Este site não é oficial.
- Mascote "Bit" e layout feitos para o Scratch Day UFPR.
