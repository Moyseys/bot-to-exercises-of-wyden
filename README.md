# Ollaman Script

Script que extrair enunciados e enviar para um modelo local via Ollama.

Pré-requisitos

-   Ollama instalado e rodando localmente (https://ollama.com/download)
-   Node.js 18+ instalado

Instalação

1. Instale dependências:

```
npm install
```

2. (Opcional) Baixe o modelo desejado para Ollama, por exemplo:

```
ollama pull gtp-oss
```

Configuração

Crie um arquivo `.env` na raiz com as variáveis:

```
OLLAMA_MODEL=""
PRACTICES_THEME=""
TOKEN = ""
X_TOKEN = ""
BATCH_SIZE=3
```

Build

```bash
npm run build
```

Execução

```bash
npm start
```
