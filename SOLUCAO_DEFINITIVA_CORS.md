# 🔧 SOLUÇÃO DEFINITIVA PARA ERRO DE CORS

## ❌ Erro Atual:
```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'https://seletivotriagem.netlify.app'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ SOLUÇÃO (Siga EXATAMENTE estes passos)

### PASSO 1: Reimplantar o Google Apps Script Corretamente

1. **Abra o Google Apps Script:**
   - Vá para: https://script.google.com
   - Abra seu projeto do script

2. **Copie TODO o código do arquivo:**
   - `google-apps-script-OPERACIONAL-COMPLETO.js` (o arquivo grande que criamos)

3. **Cole no editor do Google Apps Script**
   - Substitua TODO o código existente

4. **Configure o ID da planilha (linha 18):**
```javascript
const SPREADSHEET_ID = '1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY';
```

5. **SALVE com Ctrl+S ou Cmd+S**

### PASSO 2: Reimplantar como Web App (CRÍTICO!)

1. **Clique em "Implantar" (canto superior direito)**

2. **Escolha "Gerenciar implantações"**

3. **Se já existe uma implantação:**
   - Clique no ícone de **LÁPIS** (editar)
   - Em "Versão", selecione **"Nova versão"**
   - Clique em **"Implantar"**

4. **Se NÃO existe implantação:**
   - Clique em **"Nova implantação"**
   - Clique no ícone de **engrenagem** → **"Aplicativo da Web"**
   - Configure:
     - **Descrição:** "API do Sistema de Triagem"
     - **Executar como:** **Eu (seu email)**
     - **Quem tem acesso:** **Qualquer pessoa** ← IMPORTANTE!
   - Clique em **"Implantar"**

5. **Autorize o script:**
   - Clique em "Autorizar acesso"
   - Escolha sua conta Google
   - Clique em "Avançado"
   - Clique em "Ir para [Nome do Projeto] (não seguro)"
   - Clique em "Permitir"

6. **Copie a URL da implantação:**
   - Exemplo: `https://script.google.com/macros/s/AKfycby.../exec`

### PASSO 3: Atualizar a URL no Frontend

1. **Edite o arquivo `.env` na raiz do projeto:**
```env
VITE_GOOGLE_SCRIPT_URL=URL_QUE_VOCE_COPIOU_ACIMA
```

2. **IMPORTANTE:** A URL deve terminar com `/exec` (não `/dev`)

### PASSO 4: Rebuild e Redeploy

```bash
# Rebuild o projeto
npm run build

# Redeploy no Netlify
netlify deploy --prod --dir=dist
```

---

## 🔍 POR QUE O ERRO ACONTECE?

O Google Apps Script **NÃO adiciona headers CORS automaticamente** em todos os casos. Para funcionar:

### ✅ Configuração CORRETA (sem erro de CORS):
- ✅ Implantado como **Web App**
- ✅ "Executar como": **Eu** (seu email)
- ✅ "Quem tem acesso": **Qualquer pessoa**
- ✅ Autorizado pelo proprietário
- ✅ URL termina com `/exec`

### ❌ Configuração ERRADA (com erro de CORS):
- ❌ Não está implantado como Web App
- ❌ "Quem tem acesso" está como "Somente eu"
- ❌ Não foi autorizado
- ❌ URL termina com `/dev` (modo desenvolvimento)

---

## 🧪 TESTAR SE CORS ESTÁ FUNCIONANDO

### Teste 1: No navegador (console)

Abra o console do navegador (F12) e execute:

```javascript
fetch('SUA_URL_DO_SCRIPT?action=test')
  .then(r => r.json())
  .then(data => console.log('✅ CORS OK:', data))
  .catch(e => console.error('❌ CORS ERRO:', e));
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Conexão funcionando! CORS OK!",
  "spreadsheet_id": "...",
  "sheets": ["USUARIOS", "CANDIDATOS", ...],
  "timestamp": "2025-..."
}
```

### Teste 2: Diretamente na URL

Abra no navegador:
```
https://script.google.com/macros/s/SEU_ID/exec?action=test
```

Deve retornar JSON (não HTML de erro)

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "Authorization required"
**Solução:** Você precisa autorizar o script
- Vá em "Implantar" → "Gerenciar implantações" → "Autorizar acesso"

### Problema 2: "Script function not found"
**Solução:** O script não foi salvo ou não foi reimplantado
- Salve com Ctrl+S
- Reimplante criando uma "Nova versão"

### Problema 3: Ainda dá erro de CORS após reimplantar
**Solução:** Limpe o cache do navegador
```bash
# Chrome/Edge
Ctrl+Shift+Delete → Limpar "Imagens e arquivos em cache"

# Ou use modo anônimo
Ctrl+Shift+N
```

### Problema 4: URL termina com `/dev`
**Solução:** Use a URL de **PRODUÇÃO** (termina com `/exec`)
- Não use a URL do modo de desenvolvimento

---

## 📝 CHECKLIST FINAL

Antes de testar, confirme:

- [ ] Script foi copiado completamente
- [ ] SPREADSHEET_ID está correto
- [ ] Script foi salvo (Ctrl+S)
- [ ] Web App foi implantado com "Quem tem acesso: Qualquer pessoa"
- [ ] Nova versão foi criada na reimplantação
- [ ] Script foi autorizado
- [ ] URL copiada termina com `/exec`
- [ ] `.env` foi atualizado com a URL correta
- [ ] `npm run build` foi executado
- [ ] Deploy foi feito no Netlify
- [ ] Cache do navegador foi limpo

---

## 🎯 TESTE RÁPIDO

Execute este comando no terminal para testar:

```bash
curl "SUA_URL_DO_SCRIPT?action=test"
```

**Resultado esperado:**
```json
{"success":true,"message":"Conexão funcionando! CORS OK!","spreadsheet_id":"...","sheets":[...],"timestamp":"..."}
```

---

## 🆘 SE AINDA NÃO FUNCIONAR

1. **Verifique os logs do Google Apps Script:**
   - Apps Script → Execuções (menu lateral)
   - Veja se há erros de execução

2. **Verifique se a planilha é acessível:**
   - Abra a planilha pelo ID
   - Confirme que você tem permissão de edição

3. **Crie uma NOVA implantação do zero:**
   - Delete a implantação antiga
   - Crie uma nova do zero
   - Copie a nova URL

4. **Teste com Postman ou Insomnia:**
   - Faça uma requisição POST para a URL
   - Body: `{"action": "test"}`
   - Se funcionar no Postman mas não no navegador = problema de CORS

---

## ✅ CONFIRMAÇÃO DE SUCESSO

Você saberá que funcionou quando:

1. ✅ O console do navegador não mostra mais erros de CORS
2. ✅ A aplicação carrega a lista de analistas
3. ✅ O teste `action=test` retorna JSON
4. ✅ Todas as requisições retornam dados

---

**🎉 Depois de seguir todos estes passos, o sistema estará 100% operacional!**
