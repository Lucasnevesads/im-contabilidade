# IM Contabilidade — Site institucional

Site institucional e de captação da **IM Contabilidade (Iguchi & Marques)**, escritório contábil em Castanhal-PA.

Site estático (HTML + CSS + JavaScript puro, **sem build**), pronto para publicar no GitHub Pages.

## Estrutura

```
im-contabilidade/
├── index.html                    → Home
├── servicos.html                 → Catálogo de serviços
├── planos.html                   → Planos + simulador de orçamento
├── blog.html                     → Lista de posts do blog
├── contato.html                  → Contato (form → WhatsApp)
├── blog/
│   └── mei-limite-faturamento.html   → Post de exemplo (modelo)
├── css/
│   └── style.css                 → Todo o design system
├── js/
│   ├── main.js                   → Menu, animações, FAQ, pop-up, WhatsApp
│   └── simulador.js              → Wizard do simulador de plano
├── assets/                       → Imagens (logo, fotos) — a preencher
├── .nojekyll                     → Faz o GitHub Pages servir os arquivos como estão
└── README.md
```

## O que ajustar antes de publicar

1. **Número do WhatsApp** — em `js/main.js`, a constante `window.IM_WHATSAPP`.
   Confirmar qual dos dois números é o de atendimento:
   - (91) 98805-0643 → `5591988050643`
   - (91) 98379-9894 → `5591983799894`
2. **Logo e fotos** — colocar a logo real e as fotos da equipe na pasta `assets/`
   (hoje a logo é um selo "im." feito em CSS como placeholder).
3. **Valores dos planos** — os preços de referência (R$ 149 / 389 / 790) e a lógica
   de cálculo do simulador (`js/simulador.js`, função `calc`) são estimativas.
   Ajustar com a Iguchi & Marques para refletir a tabela real.
4. **Depoimentos e números** — os depoimentos e as estatísticas da home são
   ilustrativos. Substituir por reais quando disponíveis.
5. **Posts do blog** — usar `blog/mei-limite-faturamento.html` como modelo para
   novos artigos e atualizar os cards em `blog.html`.

## Publicar no GitHub Pages

1. Criar um repositório no GitHub (ex.: `im-contabilidade`).
2. Subir estes arquivos na branch `main`.
3. Em **Settings → Pages**, escolher a branch `main` e a pasta `/ (root)`.
4. O site fica no ar em `https://<usuario>.github.io/im-contabilidade/`.

## Design

- **Branco** como cor base, **azul-marinho** como cor de marca e **laranja** como acento.
- Fontes: Manrope (títulos) e Inter (texto), via Google Fonts.
- Animações de "revelar ao rolar" com `IntersectionObserver` (sem biblioteca externa).
- Totalmente responsivo (desktop, tablet e mobile) e com suporte a `prefers-reduced-motion`.
