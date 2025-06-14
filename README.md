# A Matemática por Detrás dos Jogos de Azar: Sorte ou Estratégia?

Este projeto foi desenvolvido no âmbito do **Prémio Pedro de Matos 2025** e tem como objetivo explorar os conceitos de probabilidade e estatística através de jogos interativos.

## 🧠 Objetivo

Através de simulações e visualizações interativas de jogos populares como Roleta, Dados e Blackjack, o projeto pretende demonstrar como a matemática influencia os resultados — desafiando a perceção de sorte e expondo o papel das probabilidades.

## 🚀 Tecnologias Utilizadas

- **React** com **TypeScript**
- **Vite** como bundler
- **CSS Puro** para a estilização
- Sem dependências externas (mínimo setup)

## 📁 Estrutura do Projeto

```
src/
│
├── components/
│   ├── Blackjack/
│   │   ├── Blackjack.tsx
│   │   ├── Blackjack.css
│   │   ├── Card.tsx
│   │   └── Card.css
│   ├── Dados/
│   │   ├── Dados.tsx
│   │   └── Dados.css
│   └── Roleta/
│       ├── Roleta.tsx
│       └── Roleta.css
│
├── pages/
│   └── Entrada.tsx
│   └── Entrada.css
│
├── App.tsx
├── main.tsx
├── Common.css
├── deviceType.ts
├── logService.ts
└── vite-env.d.ts
```

## 🧩 Componentes

### 🔢 Roleta

Simula uma roleta com 8 setores numerados de 1 a 8. Mostra o conceito de equiprobabilidade e simula sorteios automáticos e manuais.

### 🎲 Dados

Simula o lançamento de um dado de 6 faces. Explora o conceito de distribuição uniforme e variação estatística em múltiplas tentativas.

### 🂡 Blackjack

Recria uma versão simplificada do jogo de cartas. Explora decisões estratégicas e probabilidades de vitória com base nas cartas em jogo.

### 👋 Entrada

Página inicial com contexto do projeto, agradecimento ao júri e navegação para os diferentes jogos.

## 🎨 Estilização

Todo o design foi feito com CSS puro, focando-se na clareza e usabilidade, mantendo o foco na funcionalidade e visualização dos conceitos matemáticos.

## 🏁 Como Executar

1. Clona o repositório:

```bash
git clone <url-do-repositório>
```

2. Instala as dependências:

```bash
npm install
```

3. Inicia o projeto:

```bash
npm run dev
```

> Certifica-te de que tens o Node.js e o npm instalados.

## 🏆 Reconhecimento

Este projeto foi apresentado na edição de 2025 do **Prémio Pedro de Matos**, tendo como referência a participação anterior (2.º lugar em 2024).

---

## 📜 Licença

Este projeto é propriedade dos seus autores e encontra-se protegido por direitos de autor.  
A sua cópia, modificação ou redistribuição **sem autorização explícita** é **proibida**.

Ver mais detalhes no ficheiro [`LICENSE`](./LICENSE).
