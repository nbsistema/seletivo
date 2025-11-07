# Guia Completo de Solução de Erros CORS e Conexão

Este guia resolve todos os problemas relacionados a CORS, falhas de conexão e erros do Google Apps Script.

---

## 🚨 Erros Identificados

### 1. Erro CORS
```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'https://seletivetriagem.netlify.app'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 2. Failed to load resource: net::ERR_FAILED
```
Failed to script.google.com/ma…ial03%40gmail.com:1 load resource: net::ERR_FAILED
```

### 3. Erro na comunicação com Google Apps Script
```
Erro na comunicação com Google Apps Script: TypeError: Failed to fetch
```

---

## ✅ SOLUÇÕES COMPLETAS

## 📝 PASSO 1: Atualizar o Google Apps Script

### 1.1 Abrir o Editor

1. Acesse sua planilha do Google Sheets
2. Vá em **Extensões** → **Apps Script**
3. Delete TODO o código existente

### 1.2 Colar o Novo Código

Abra o arquivo `google-apps-script-complete.js` deste projeto e cole TODO o conteúdo no editor.

### 1.3 Configurar o SPREADSHEET_ID

No início do código, localize:
```javascript
const SPREADSHEET_ID = '1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY';
```

Substitua pelo ID da SUA planilha (encontre na URL da planilha).

### 1.4 Salvar

Pressione `Ctrl+S` (Windows) ou `Cmd+S` (Mac) e nomeie: **"Sistema Triagem"**

---

## 📦 PASSO 2: Reimplantar o Web App

**IMPORTANTE:** Você DEVE reimplantar para que as mudanças tenham efeito!

### 2.1 Criar Nova Implantação

1. Clique em **Implantar** (canto superior direito)
2. Selecione **Nova implantação**
3. Clique no ícone de **engrenagem** ao lado de "Selecionar tipo"
4. Escolha **Aplicativo da Web**

### 2.2 Configurações CRÍTICAS

Configure EXATAMENTE assim:

```
Descrição: Sistema de Triagem v2
Executar como: EU (seu email)
Quem tem acesso: QUALQUER PESSOA
```

**MUITO IMPORTANTE:**
- ✅ **"Executar como"** DEVE ser **"Eu"** (seu email)
- ✅ **"Quem tem acesso"** DEVE ser **"Qualquer pessoa"**

### 2.3 Autorizar Novamente

1. Clique em **Implantar**
2. Se aparecer pedindo autorização, clique em **Autorizar acesso**
3. Escolha sua conta Google
4. Se aparecer "Este app não foi verificado":
   - Clique em **Avançado**
   - Clique em **Ir para Sistema Triagem (não seguro)**
   - Clique em **Permitir**

### 2.4 Copiar a Nova URL

Após implantar, você verá algo como:
```
URL do aplicativo da Web: https://script.google.com/macros/s/AKfyc.../dev
```

**COPIE ESTA URL COMPLETA!**

---

## 🌐 PASSO 3: Atualizar URLs no Projeto

### 3.1 Arquivo Local `.env`

Abra o arquivo `.env` e atualize:
```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/[COLE_SUA_URL_AQUI]/dev
```

### 3.2 Netlify (Produção)

1. Acesse https://app.netlify.com
2. Selecione seu site
3. Vá em **Site settings** → **Environment variables**
4. Encontre `VITE_GOOGLE_SCRIPT_URL`
5. Clique em **Edit**
6. Cole a nova URL
7. Clique em **Save**
8. Vá em **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

---

## 🧪 PASSO 4: Testar a Conexão

### 4.1 Teste Direto no Navegador

Abra uma nova aba e cole a URL com o teste:
```
https://script.google.com/macros/s/[SUA_URL]/dev?action=test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Conexão funcionando!",
  "spreadsheet_id": "1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY",
  "sheets": ["USUARIOS", "CANDIDATOS"],
  "timestamp": "2025-11-07T..."
}
```

Se ver esta resposta, está funcionando! ✅

### 4.2 Teste de Usuário

Teste buscar um usuário (se você tiver algum na planilha):
```
https://script.google.com/macros/s/[SUA_URL]/dev?action=getUserRole&email=admin@test.com
```

---

## 📊 PASSO 5: Verificar Estrutura das Planilhas

### 5.1 Aba USUARIOS

Certifique-se de que existe uma aba chamada **"USUARIOS"** com estas colunas:

| Email | Nome | Role | Ativo | Password |
|-------|------|------|-------|----------|
| admin@test.com | Admin Teste | admin | TRUE | 123456 |

**Adicione pelo menos UM usuário admin para testar!**

### 5.2 Aba CANDIDATOS

Crie uma aba chamada **"CANDIDATOS"** com estas colunas:

```
id | registration_number | NOMECOMPLETO | NOMESOCIAL | CPF | VAGAPCD | LAUDO MEDICO |
AREAATUACAO | CARGOPRETENDIDO | CURRICULOVITAE | DOCUMENTOSPESSOAIS |
DOCUMENTOSPROFISSIONAIS | DIPLOMACERTIFICADO | DOCUMENTOSCONSELHO |
ESPECIALIZACOESCURSOS | status | status_triagem | data_hora_triagem |
analista_triagem | assigned_to | assigned_by | assigned_at | priority | notes |
created_at | updated_at
```

**Nota:** O script criará automaticamente estas abas se não existirem na primeira chamada.

---

## 🔧 PASSO 6: Solução de Problemas Específicos

### Problema: "ERR_FAILED" ou "Failed to fetch"

**Causa:** URL incorreta ou script não implantado corretamente.

**Solução:**
1. Verifique se copiou a URL COMPLETA incluindo `/dev` no final
2. Reimplante o script (Passo 2)
3. Limpe o cache do navegador (`Ctrl+Shift+Delete`)
4. Teste a URL diretamente no navegador (Passo 4)

### Problema: "CORS policy: No 'Access-Control-Allow-Origin'"

**Causa:**
- Script antigo sem suporte a CORS
- Configuração incorreta no Apps Script

**Solução:**
1. Certifique-se de usar o código atualizado do `google-apps-script-complete.js`
2. Verifique se "Quem tem acesso" está como **"Qualquer pessoa"**
3. Reimplante o script

### Problema: "Ação não encontrada"

**Causa:** Parâmetro `action` não foi passado ou está incorreto.

**Solução:**
Sempre passe o parâmetro `action`:
```
?action=getUserRole&email=test@test.com
?action=getCandidates
?action=test
```

### Problema: "Planilha não encontrada"

**Causa:** SPREADSHEET_ID incorreto ou sem permissões.

**Solução:**
1. Copie o ID da URL da sua planilha
2. Atualize no código do Apps Script:
   ```javascript
   const SPREADSHEET_ID = 'SEU_ID_AQUI';
   ```
3. Salve e reimplante

### Problema: "Não autorizado" ou "Permission denied"

**Causa:** Falta de permissões ou autorização expirada.

**Solução:**
1. No Apps Script, vá em **Execuções** (à esquerda)
2. Veja se há erros de permissão
3. Reimplante e reautorize (Passo 2.3)
4. Certifique-se de que "Executar como" está como **"Eu"**

### Problema: Dados não aparecem no frontend

**Solução:**
1. Teste a URL manualmente no navegador
2. Verifique se há dados nas planilhas USUARIOS e CANDIDATOS
3. Abra o DevTools do navegador (`F12`)
4. Vá na aba **Console** e veja os erros
5. Vá na aba **Network** e veja se as requisições estão sendo feitas
6. Verifique se a URL no Netlify está correta

---

## 🔒 PASSO 7: Verificar Segurança

### 7.1 Logs no Apps Script

1. No Google Apps Script Editor
2. Clique em **Execuções** no menu lateral
3. Veja todas as chamadas recentes
4. Clique em uma execução para ver detalhes e logs

### 7.2 Permissões

Verifique se você é o dono da planilha e tem permissões de edição.

---

## 🚀 PASSO 8: Teste Final no Sistema

1. Acesse seu site: https://seletivetriagem.netlify.app
2. Tente fazer login com o usuário que você criou
3. Se der erro, abra o DevTools (`F12`) e veja o erro no Console
4. Compare a URL que está sendo chamada com a URL do seu Web App

---

## 📋 CHECKLIST FINAL

Antes de testar, confirme:

- [ ] ✅ Código do Google Apps Script atualizado
- [ ] ✅ SPREADSHEET_ID configurado corretamente
- [ ] ✅ Web App implantado como "Aplicativo da Web"
- [ ] ✅ "Executar como": Eu
- [ ] ✅ "Quem tem acesso": Qualquer pessoa
- [ ] ✅ Autorização concedida
- [ ] ✅ URL copiada corretamente (com `/dev` no final)
- [ ] ✅ URL atualizada no `.env` local
- [ ] ✅ URL atualizada no Netlify
- [ ] ✅ Netlify redesployado (Clear cache and deploy)
- [ ] ✅ Aba USUARIOS existe com pelo menos 1 usuário
- [ ] ✅ Teste ?action=test funcionou no navegador

---

## 💡 DICAS IMPORTANTES

### Use Sempre a URL `/dev`

A URL termina com `/dev` ou `/exec`:
- `/dev` = versão de desenvolvimento (sempre a mais recente)
- `/exec` = versão específica (não muda, mas não pega atualizações)

**Recomendação:** Use `/dev` para desenvolvimento e testes.

### Cache do Navegador

Às vezes o navegador guarda URLs antigas. Limpe o cache:
- Chrome/Edge: `Ctrl+Shift+Delete`
- Firefox: `Ctrl+Shift+Delete`
- Safari: `Cmd+Option+E`

### Modo Anônimo

Teste em uma aba anônima para garantir que não há cache:
- Chrome/Edge: `Ctrl+Shift+N`
- Firefox: `Ctrl+Shift+P`

### DevTools

Use o DevTools (`F12`) para debug:
- **Console**: Veja erros de JavaScript
- **Network**: Veja requisições HTTP e respostas
- **Application**: Veja localStorage e cookies

---

## 🆘 AINDA COM PROBLEMAS?

### 1. Verifique os Logs

No Google Apps Script, vá em **Execuções** e veja os logs das últimas chamadas.

### 2. Teste Manualmente

Use ferramentas como:
- Postman: https://www.postman.com/
- Insomnia: https://insomnia.rest/
- curl no terminal

Exemplo com curl:
```bash
curl "https://script.google.com/macros/s/[SUA_URL]/dev?action=test"
```

### 3. Verifique a Conta Google

Certifique-se de que:
- Você está logado na conta Google correta
- A planilha está na mesma conta
- Você tem permissões de proprietário ou editor

### 4. Crie uma Nova Implantação

Se nada funcionar:
1. Delete todas as implantações antigas
2. Crie uma NOVA implantação do zero
3. Copie a nova URL
4. Atualize em TODOS os lugares

---

## 📞 RESUMO RÁPIDO

1. ✅ Atualize o código no Google Apps Script
2. ✅ Configure o SPREADSHEET_ID
3. ✅ Implante como "Aplicativo da Web" com "Qualquer pessoa"
4. ✅ Copie a URL completa (com `/dev`)
5. ✅ Atualize no `.env` e no Netlify
6. ✅ Redesploye o Netlify
7. ✅ Teste ?action=test no navegador
8. ✅ Crie usuário na planilha USUARIOS
9. ✅ Teste o login no sistema

---

✅ **Seguindo este guia, todos os erros de CORS e conexão serão resolvidos!**
