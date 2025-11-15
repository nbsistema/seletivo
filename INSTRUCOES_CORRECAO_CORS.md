# 🔧 INSTRUÇÕES PARA CORRIGIR ERRO CORS

## ❌ PROBLEMA IDENTIFICADO

Erro CORS bloqueando a conexão:
```
Access to fetch at 'https://script.google.com/...' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ SOLUÇÃO

O Google Apps Script precisa retornar headers CORS corretos. Criei um novo script completo.

---

## 📋 PASSO A PASSO

### 1️⃣ Abrir o Google Apps Script

1. Acesse: https://script.google.com
2. Abra seu projeto existente ou crie um novo

### 2️⃣ Substituir o Código Completo

1. **APAGUE** todo o código atual do Google Apps Script
2. **ABRA** o arquivo: `google-apps-script-CORS-COMPLETO.js` (criado neste projeto)
3. **COPIE** todo o conteúdo
4. **COLE** no Google Apps Script

### 3️⃣ Configurar o ID da Planilha

Localize esta linha no início do script (linha 15):
```javascript
const SPREADSHEET_ID = '1iQSQ06P_OXkqxaGWN3uG5jRYFBKyjWqQyvzuGk2EplY';
```

✅ Se este for o ID correto da sua planilha, mantenha
⚠️ Se não, substitua pelo ID correto

### 4️⃣ Salvar e Implantar

1. Clique em **Salvar** (ícone de disquete ou Ctrl+S)
2. Clique em **Implantar** → **Nova implantação**
3. Configure:
   - **Tipo**: Aplicativo da Web
   - **Execute como**: Eu (seu email)
   - **Quem tem acesso**: Qualquer pessoa
4. Clique em **Implantar**
5. **COPIE** a URL do Web App gerada

### 5️⃣ Atualizar a URL na Aplicação

Você tem duas opções:

#### Opção A: Usar a URL Diretamente (Recomendado)

Edite o arquivo: `src/contexts/AuthContext.tsx`

Localize a linha 131:
```typescript
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx...';
```

Substitua pela **nova URL** copiada no passo 4.

#### Opção B: Usar Variável de Ambiente

1. Edite o arquivo `.env`
2. Adicione ou atualize:
```
VITE_GOOGLE_SCRIPT_URL=SUA_URL_AQUI
```

3. Edite `src/contexts/AuthContext.tsx` (linha 131):
```typescript
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/...';
```

---

## 🔍 O QUE FOI CORRIGIDO

### No Google Apps Script:

1. ✅ Adicionada função `getCorsHeaders()` que retorna headers CORS corretos
2. ✅ Todos os headers CORS configurados:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE`
   - `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept`
3. ✅ Função `createResponse()` aplica headers CORS em TODAS as respostas
4. ✅ Adicionada função `doOptions()` para preflight requests

### Na Aplicação:

1. ✅ Corrigida leitura da resposta do Google Apps Script
2. ✅ Agora espera formato: `{ success: true, data: {...} }`
3. ✅ Melhor tratamento de erros com logs detalhados

---

## 🧪 TESTAR A CONEXÃO

Após seguir todos os passos:

1. Abra o console do navegador (F12)
2. Tente fazer login
3. Verifique os logs:
   - ✅ Deve mostrar: "📡 [AuthContext] Resposta recebida - Status: 200"
   - ✅ Deve mostrar: "✅ [AuthContext] Dados recebidos: {...}"
   - ❌ NÃO deve mostrar erros CORS

---

## ⚠️ VERIFICAÇÕES IMPORTANTES

### Verificar Estrutura da Planilha

Certifique-se que a aba **USUARIOS** tem estas colunas:
- Email
- Nome
- Role
- Ativo

### Verificar Role dos Usuários

Os valores válidos para Role são:
- `admin`
- `analista`
- `entrevistador`

**IMPORTANTE**: Use minúsculas!

---

## 📊 ESTRUTURA DE RESPOSTA

O novo script retorna respostas neste formato:

### Sucesso:
```json
{
  "success": true,
  "data": {
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "analista",
    "active": true
  }
}
```

### Erro:
```json
{
  "error": "Descrição do erro"
}
```

---

## 🆘 TROUBLESHOOTING

### Ainda recebo erro CORS?

1. ✅ Certifique-se que implantou como "Nova implantação" (não "Gerenciar implantações")
2. ✅ Verifique se "Quem tem acesso" está como "Qualquer pessoa"
3. ✅ Copie a URL EXATA da implantação
4. ✅ Limpe o cache do navegador (Ctrl+Shift+Delete)
5. ✅ Teste em uma aba anônima

### Erro "Usuário não encontrado"?

1. ✅ Verifique a aba USUARIOS na planilha
2. ✅ Confirme que o email está correto
3. ✅ Verifique que a coluna "Ativo" está como TRUE
4. ✅ Confirme que a coluna "Role" tem valor válido

### Erro "Planilha não encontrada"?

1. ✅ Verifique o SPREADSHEET_ID no script
2. ✅ Confirme que você tem acesso à planilha
3. ✅ Verifique se as abas têm os nomes corretos (MAIÚSCULAS)

---

## 📝 NOTAS FINAIS

- O script agora é **totalmente compatível com CORS**
- Todas as funções retornam o mesmo formato de resposta
- Headers CORS são aplicados automaticamente em TODAS as respostas
- Suporta requisições GET, POST e OPTIONS (preflight)

---

## ✅ CHECKLIST

Antes de testar:

- [ ] Script atualizado no Google Apps Script
- [ ] SPREADSHEET_ID configurado corretamente
- [ ] Nova implantação criada
- [ ] URL copiada
- [ ] URL atualizada na aplicação (AuthContext.tsx ou .env)
- [ ] Cache do navegador limpo
- [ ] Aba USUARIOS configurada corretamente
- [ ] Usuário teste criado com Role válido

---

Se seguir todos os passos corretamente, o erro CORS será resolvido! 🎉
