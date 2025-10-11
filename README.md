# Ollaman Script

Script que usa Selenium para entrar em um site de exercícios, extrair enunciados e enviar para um modelo local via Ollama.

Pré-requisitos

- Ollama instalado e rodando localmente (https://ollama.com/download)
- Node.js 18+ instalado
- Google Chrome/Chromium instalado (ou outro navegador compatível com chromedriver)

Instalação

1. Instale dependências:

```
npm install
```

2. (Opcional) Baixe o modelo desejado para Ollama, por exemplo:

```
ollama pull llama21
```

Configuração

Crie um arquivo `.env` na raiz com as variáveis:

```
SITE_URL=https://endereco-do-exercicio/ou-login
SITE_USER=seu_usuario (opcional)
SITE_PASS=sua_senha (opcional)
OLLAMA_MODEL=llama21
```

Execução

```bash
npm start
```

Descrição dos arquivos

- `main.js` — orquestra o fluxo: usa `scraper.js` para extrair enunciados e `ollamaClient.js` para enviar prompts ao modelo.
- `scraper.js` — implementação com Selenium WebDriver (Chrome) para login e extração de textos (seletors genéricos; ajuste conforme o site alvo).
- `ollamaClient.js` — wrapper mínimo para a biblioteca oficial `ollama`.

Notas e ajustes

- Os seletores em `scraper.js` são genéricos e podem não funcionar com todos os sites — edite para combinar com a estrutura do HTML do sistema de exercícios.
- Por padrão o navegador roda em modo headless. Para ver a execução graficamente, altere o parâmetro `headless` para `false` em `main.js` ao chamar `scrapeExercises`.
- Este script não viola sites; use somente em sistemas que você tem permissão para acessar/raspar.

Próximos passos

- Melhorar a identificação dos enunciados com regras específicas do site alvo (classes e atributos).
- Adicionar retries e timeout configuráveis.
- Persistir resultados em JSON/arquivo se desejar.
