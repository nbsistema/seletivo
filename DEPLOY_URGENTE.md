# 🚨 DEPLOY URGENTE - Sistema Corrigido

## Problema Identificado

O sistema em produção está tentando chamar diretamente o Google Apps Script, causando erros de CORS. A versão corrigida já está pronta e precisa ser deployada.

## O que foi corrigido

✅ Todas as chamadas agora passam pelo proxy Netlify
✅ Variável `VITE_GOOGLE_SCRIPT_URL=/.netlify/functions/google-sheets-proxy` configurada
✅ Build realizado com sucesso
✅ Proxy validado no bundle final

## Como fazer o deploy no Netlify

### Opção 1: Deploy Manual via Interface

1. Acesse https://app.netlify.com
2. Faça login na sua conta
3. Selecione o site `seletivotriagem`
4. Clique em **"Deploys"** no menu
5. Arraste a pasta `dist` para a área de deploy
6. Aguarde o deploy finalizar (1-2 minutos)
7. Teste o sistema

### Opção 2: Deploy via Git (Recomendado)

```bash
# 1. Commit das mudanças
git add .
git commit -m "fix: Configurar proxy Netlify para todas as requisições"

# 2. Push para o repositório
git push origin main

# O Netlify fará o deploy automaticamente
```

## Verificação Pós-Deploy

1. Acesse https://seletivotriagem.netlify.app
2. Abra o Console do navegador (F12)
3. Tente fazer login
4. Verifique os logs - devem aparecer:
   ```
   📤 [AuthContext] Enviando requisição: getUserRole
   📦 [AuthContext] Payload: { action: 'getUserRole', ... }
   📡 [AuthContext] Status da resposta: 200
   ✅ [AuthContext] Dados recebidos: { ... }
   ```

5. **NÃO** deve aparecer:
   - ❌ Erros de CORS
   - ❌ URL do `script.google.com`
   - ❌ `Failed to fetch`

## Arquivos Modificados neste Fix

- `.env` - Adicionada variável `VITE_GOOGLE_SCRIPT_URL`
- `src/services/googleSheets.ts` - Usa POST com proxy
- `src/services/candidateService.ts` - Usa POST com proxy
- `src/services/userService.ts` - Usa POST com proxy
- `src/contexts/AuthContext.tsx` - Usa POST com proxy
- `dist/*` - Build atualizado com proxy

## Fluxo Correto Após Deploy

```
Frontend (Browser)
    ↓ POST para /.netlify/functions/google-sheets-proxy
Netlify Function (Serverless)
    ↓ POST para script.google.com
Google Apps Script
    ↓ JSON Response
Netlify Function
    ↓ JSON Response
Frontend (Browser)
```

## URLs do Sistema

- **Frontend em Produção**: https://seletivotriagem.netlify.app
- **Netlify Admin**: https://app.netlify.com/sites/seletivotriagem
- **Google Apps Script**: https://script.google.com/macros/s/AKfycbxfl0gWq3-dnZmYcz5AIHkpOyC1XdRb8QdaMRQTQZnn5sqyQZvV3qhCevhXuFHGYBk0/exec

## Status Atual

- ✅ Código corrigido
- ✅ Build gerado
- 🔄 **AGUARDANDO DEPLOY NO NETLIFY**
- ⏳ Teste em produção pendente

## Próximos Passos

1. **AGORA**: Fazer deploy no Netlify (seguir instruções acima)
2. Testar login e funções básicas
3. Verificar logs no console
4. Confirmar que não há mais erros de CORS

---

**⚠️ IMPORTANTE**: O sistema só funcionará após o deploy. A versão atual em https://seletivotriagem.netlify.app ainda está com o código antigo.
