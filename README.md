# Dashboard Financeiro

Dashboard em Angular que reúne, em uma única tela, cotação de moedas, o ciclo de juros da SELIC e um indicador de sentimento de mercado.

**Demo:** 

![Preview do dashboard](dashboard-de-cambio-modular/assets/global-flow-demo.gif)


---

## Sobre o projeto

A ideia foi construir um painel que responda rápido a três perguntas que qualquer pessoa acompanhando o mercado faz no dia a dia: como estão as moedas hoje, em que ponto do ciclo de juros estamos e qual o humor geral do mercado. Tudo consumindo dados reais de API, com tratamento de carregamento e de erro.

## Funcionalidades

- **Cotação de moedas** — `CardComponent` reutilizável que exibe a cotação atual, variação e direção do movimento. O mesmo componente atende a todas as moedas via `@Input`.
- **Ciclo de juros / SELIC** — visualização da taxa ao longo do tempo, deixando visível se o ciclo está de alta, queda ou estabilidade.
- **Sentimento de mercado** — indicador consolidado que traduz os dados em uma leitura rápida de otimismo/pessimismo.
- Estados de **loading** e **erro** tratados em cada widget, sem quebrar o restante da tela.
- Layout responsivo para desktop e mobile.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Angular <!-- TROCAR: versão, ex. 18 --> |
| Linguagem | TypeScript |
| Reatividade | RxJS |
| Estilos | SCSS |
| Gráficos | <!-- TROCAR: Chart.js / ngx-charts / ApexCharts --> |
| Dados | <!-- TROCAR: ex. API do Banco Central (SGS) e AwesomeAPI --> |

## Como rodar

Pré-requisitos: Node.js 18+ e npm.

```bash

git clone https://github.com/esc20/<!-- TROCAR: nome-do-repo -->.git
cd <!-- TROCAR: nome-do-repo -->


npm install


ng serve
```

Acesse `http://localhost:4200`. A aplicação recarrega sozinha a cada alteração nos arquivos.

```bash

ng build


ng test
```

## Estrutura

```
src/
├── app/
│   ├── components/      # componentes reutilizáveis (CardComponent, etc.)
│   ├── pages/           # telas do dashboard
│   ├── services/        # consumo de APIs e regras de negócio
│   ├── models/          # interfaces e tipos
│   └── shared/          # pipes, diretivas e utilitários
├── assets/
└── styles/              # variáveis e estilos globais
```

## Decisões técnicas

- **Componente de card genérico:** em vez de um componente por moeda, criei um `CardComponent` que recebe os dados por `@Input`. Menos código duplicado e, para incluir um novo ativo, basta passar outro objeto.
- **Serviços isolados da camada de view:** cada integração com API vive em um service próprio, retornando `Observable`. Os componentes não conhecem detalhes de HTTP, o que deixa a troca de provedor de dados barata.
- **Tratamento de erro por widget:** uma API fora do ar derruba apenas o card correspondente; o restante do dashboard continua utilizável.
- **Tipagem explícita das respostas:** interfaces em `models/` para cada retorno de API, evitando `any` e pegando quebra de contrato ainda em tempo de compilação.


## Próximos passos

- [ ] Testes unitários dos services e do `CardComponent`
- [ ] Cache das requisições para reduzir chamadas repetidas à API
- [ ] Modo escuro
- [ ] Histórico comparativo entre períodos
- [ ] Deploy automatizado via GitHub Actions

## Contato

Feito por [@esc20](https://github.com/esc20).
