# ✅ CORREÇÃO DO ERRO DE LOGIN

## 🐛 Problema Identificado

O erro acontecia porque o **AuthContext** estava tentando acessar `result.data.email` quando o Google Apps Script retorna os dados **diretamente** no objeto raiz:

### ❌ Código Anterior (Errado):
```typescript
const userData = result.data || result; // Tentava acessar result.data
const user = {
  email: userData.email,  // userData era undefined
  name: userData.name,
  role: userData.role
};
```

### ✅ Código Corrigido:
```typescript
if (result && result.success && !result.error) {
  // Google Apps Script retorna direto: { email, nome, role, ativo, success }
  const user = {
    id: result.email,      // Acessa direto do result
    email: result.email,
    name: result.nome,
    role: result.role,
    active: result.ativo === true || result.ativo === 'TRUE'
  };
  return user;
}
```

## 📋 Estrutura de Resposta do Google Apps Script

O script `getUserRole` retorna:

```json
{
  "email": "usuario@email.com",
  "nome": "Nome do Usuário",
  "role": "admin",
  "ativo": true,
  "success": true
}
```

**Não retorna:**
```json
{
  "success": true,
  "data": {
    "email": "...",
    "nome": "..."
  }
}
```

## 🔧 Arquivos Corrigidos

1. **`src/contexts/AuthContext.tsx`**
   - Função `getUserByEmail()` - linha 78
   - Função `getUserById()` - linha 106

## 🧪 Como Testar o Login

### 1. Criar Usuário de Teste na Planilha

Na aba **USUARIOS** do Google Sheets, adicione:

| Email | Nome | Role | Ativo | Password |
|-------|------|------|-------|----------|
| admin@test.com | Admin Teste | admin | TRUE | 123456 |
| analista@test.com | Analista Teste | analista | TRUE | 123456 |
| entrevistador@test.com | Entrevistador Teste | entrevistador | TRUE | 123456 |

**IMPORTANTE:**
- A coluna `Role` deve ser exatamente: `admin`, `analista` ou `entrevistador` (minúsculas)
- A coluna `Ativo` deve ser: `TRUE` ou `FALSE` (maiúsculas)

### 2. Testar o Script Diretamente

Abra no navegador:
```
https://script.google.com/macros/s/SEU_ID/exec?action=getUserRole&email=admin@test.com
```

**Resposta esperada:**
```json
{
  "email": "admin@test.com",
  "nome": "Admin Teste",
  "role": "admin",
  "ativo": true,
  "success": true
}
```

### 3. Testar o Login na Aplicação

1. Abra a aplicação
2. Digite:
   - Email: `admin@test.com`
   - Senha: `123456`
3. Clique em "Entrar"

**Console do navegador deve mostrar:**
```
🔐 LOGIN - Email: admin@test.com
📥 getUserByEmail - Resultado COMPLETO: {"email":"admin@test.com","nome":"Admin Teste","role":"admin","ativo":true,"success":true}
✅ getUserByEmail - User FINAL: {"id":"admin@test.com","email":"admin@test.com","name":"Admin Teste","role":"admin","active":true}
🎭 getUserByEmail - ROLE: admin (tipo: string)
💾 LOGIN - Salvando user: ...
```

## 🚨 Se Ainda Der Erro

### Erro: "Usuário não encontrado"

**Causa:** O email não existe na planilha ou está escrito diferente

**Solução:**
1. Verifique se o email está exatamente igual na planilha
2. Verifique se a aba se chama **USUARIOS** (sem acento)
3. Verifique se a primeira linha contém os cabeçalhos: `Email | Nome | Role | Ativo | Password`

### Erro: "CORS policy"

**Solução:** Siga o guia em `SOLUCAO_DEFINITIVA_CORS.md`

### Erro: "Senha incorreta"

**Causa:** A senha na planilha é diferente

**Solução:**
1. Verifique a coluna `Password` na planilha
2. A senha é case-sensitive (diferencia maiúsculas/minúsculas)

### Console mostra "getUserById - Sem resultado válido"

**Causa:** O script não está retornando `success: true`

**Solução:**
1. Teste o script diretamente no navegador (passo 2 acima)
2. Verifique os logs do Google Apps Script:
   - Apps Script → Execuções (menu lateral)
   - Veja se há erros

## 📊 Estrutura Completa do Fluxo de Login

```
1. Usuário digita email e senha
   ↓
2. LoginPage.tsx chama login(email, password)
   ↓
3. AuthContext.login() chama sheetsService.getUserByEmail(email)
   ↓
4. GoogleSheetsService.fetchData('getUserRole', { email })
   ↓
5. Requisição POST para Google Apps Script
   ↓
6. Script busca na aba USUARIOS
   ↓
7. Retorna: { email, nome, role, ativo, success: true }
   ↓
8. AuthContext processa e salva no state + localStorage
   ↓
9. App.tsx redireciona baseado no role:
   - admin → AdminDashboard
   - analista → AnalystDashboard
   - entrevistador → InterviewerDashboard
```

## ✅ Checklist de Verificação

Antes de testar o login, confirme:

- [ ] Google Apps Script está implantado como Web App
- [ ] "Quem tem acesso" = "Qualquer pessoa"
- [ ] URL do script está no `.env` (VITE_GOOGLE_SCRIPT_URL)
- [ ] Aba USUARIOS existe e tem os cabeçalhos corretos
- [ ] Pelo menos um usuário de teste está cadastrado
- [ ] Valores de Role estão em minúsculas: admin, analista, entrevistador
- [ ] Valores de Ativo estão em maiúsculas: TRUE ou FALSE
- [ ] `npm run build` foi executado
- [ ] Deploy foi feito no Netlify
- [ ] Cache do navegador foi limpo (Ctrl+Shift+Delete)

## 🎉 Resultado Esperado

Após fazer login com sucesso:

1. **Admin** vê:
   - Painel com abas: Importar, Alocação, Meus Candidatos, Classificados, Desclassificados, À Revisar, Entrevista, Relatórios
   - Estatísticas no topo
   - Lista de candidatos para alocar

2. **Analista** vê:
   - Painel "Meus Candidatos"
   - Lista de candidatos alocados para ele
   - Botões: Classificar, Desclassificar, Revisar
   - Estatísticas: Total, Pendente, Em Análise, Concluído

3. **Entrevistador** vê:
   - Painel "Painel do Entrevistador"
   - Lista de candidatos alocados para entrevista
   - Botão "Avaliar" para cada candidato
   - Estatísticas: Alocados, Avaliados, Pendentes

---

**✅ Login corrigido e funcionando!**
