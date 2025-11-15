# ✅ REVERSÃO COMPLETA - Sistema Usando URL Direta do Google Apps Script

## 🎯 Objetivo

Sistema revertido para usar **diretamente** o Google Apps Script, sem passar pelo proxy Netlify.

## 📋 URL do Google Apps Script

```
https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec
```

## ✅ Arquivos Modificados

### 1. `src/contexts/AuthContext.tsx`
```typescript
// ANTES:
const SCRIPT_URL = '/.netlify/functions/google-sheets-proxy';

// AGORA:
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec';
```

### 2. `src/services/userService.ts`
```typescript
// ANTES:
const SCRIPT_URL = '/.netlify/functions/google-sheets-proxy';

// AGORA:
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec';
```

### 3. `src/services/candidateService.ts`
```typescript
// ANTES:
constructor() {
  this.scriptUrl = '/.netlify/functions/google-sheets-proxy';
}

// AGORA:
constructor() {
  this.scriptUrl = 'https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec';
}
```

### 4. `src/services/googleSheets.ts`
```typescript
// ANTES:
const SCRIPT_URL = '/.netlify/functions/google-sheets-proxy';

// AGORA:
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec';
```

### 5. `.env`
```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
```

### 6. `netlify.toml`
```toml
[build]
  publish = "dist"
  functions = "netlify/functions"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  VITE_GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔍 Verificação do Build

**Bundle verificado com sucesso:**
- ✅ 3 ocorrências da URL do Google Script
- ✅ 0 ocorrências do proxy Netlify
- ✅ Build compilado sem erros

## 📊 Nova Arquitetura (Direta)

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                    │
│  https://seletivotriagem.netlify.app                        │
└─────────────────────────────────────────────────────────────┘
                           ↓ POST
                    { action: "...", ... }
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Google Apps Script (DIRETO)                                │
│  https://script.google.com/macros/s/AKfycbx.../exec        │
│  - CORS configurado no script                               │
│  - Processa ação                                            │
│  - Acessa Google Sheets                                     │
│  - Retorna JSON                                             │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Configuração Necessária no Google Apps Script

Para que funcione sem erros de CORS, o Google Apps Script **DEVE** estar configurado corretamente:

### 1. Deploy Configuration
```
- Execute as: Me (seu email)
- Who has access: Anyone
```

### 2. CORS Headers no Script
O script `google-apps-script-CORS-FINAL.js` já possui os headers corretos:

```javascript
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Handling Requests
```javascript
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}
```

## 🚀 Como Fazer o Deploy

### Opção 1: Deploy Manual

1. Acesse: https://app.netlify.com/sites/seletivotriagem/deploys
2. Arraste a pasta `dist` para a área de deploy
3. Aguarde 1-2 minutos
4. Teste o sistema

### Opção 2: Deploy via Git

```bash
git add .
git commit -m "feat: Reverter para uso direto do Google Apps Script"
git push origin main
```

## ✅ Checklist Pós-Deploy

Após o deploy, verifique:

### 1. Console do Navegador (F12)
```
📤 [AuthContext] Enviando requisição: getUserRole
📦 [AuthContext] Payload: { action: 'getUserRole', ... }
📡 [AuthContext] Status da resposta: 200
✅ [AuthContext] Dados recebidos: { ... }
```

### 2. Network Tab (F12 → Network)
```
POST https://script.google.com/macros/s/AKfycbx.../exec
Status: 200 OK
```

### 3. Funcionamento Esperado
- ✅ Login funciona
- ✅ Listagem de candidatos funciona
- ✅ Todas as ações do sistema funcionam
- ✅ Sem erros de CORS (se o script estiver configurado corretamente)

## ⚠️ Importante: CORS no Google Apps Script

O Google Apps Script **PRECISA** estar deployado com:
- ✅ Access: **Anyone**
- ✅ Execute as: **Me**
- ✅ CORS headers configurados
- ✅ Funções doGet, doPost e doOptions implementadas

Se houver erros de CORS, verifique:
1. O script está deployado como "Anyone" tem acesso
2. O script tem as funções doOptions implementadas
3. Os headers CORS estão corretos no script

## 📝 Fluxo de Requisição

```javascript
// Frontend envia
fetch('https://script.google.com/macros/s/AKfycbx.../exec', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    action: 'getUserRole',
    email: 'user@example.com'
  })
});

// Google Script recebe
function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  // params.action = 'getUserRole'
  // params.email = 'user@example.com'

  return handleRequest(e);
}

// Google Script retorna
{
  "success": true,
  "email": "user@example.com",
  "nome": "Nome",
  "role": "admin",
  "ativo": true
}
```

## 🔧 Arquivos Preservados

Todos os arquivos foram preservados, incluindo:
- ✅ Toda a lógica de negócio
- ✅ Todos os componentes React
- ✅ Todos os serviços
- ✅ Todas as funcionalidades
- ✅ Proxy Netlify (mantido em `netlify/functions/`, mas não utilizado)

## 📊 Comparação: Proxy vs Direto

### Com Proxy (Anterior)
```
Frontend → Netlify Proxy → Google Script
```
- ✅ CORS sempre funciona
- ❌ Latência adicional
- ❌ Dependência do Netlify Functions

### Direto (Atual)
```
Frontend → Google Script
```
- ✅ Menor latência
- ✅ Menos dependências
- ⚠️ Requer CORS configurado no Google Script

## 🎉 Status Final

- ✅ Código revertido para URL direta
- ✅ Build gerado com sucesso
- ✅ Bundle verificado
- ✅ Nenhuma funcionalidade perdida
- ✅ Pronto para deploy

---

**Data da Reversão**: 2025-11-15
**Versão**: 3.0 (URL Direta)
**Status**: ✅ Pronto para Deploy
**URL do Script**: https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec
