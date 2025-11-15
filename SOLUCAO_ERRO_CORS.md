# Solução do Erro CORS - Sistema de Triagem

## Problema

A aplicação está apresentando erros CORS ao tentar se comunicar com o Google Apps Script:

```
Access-Control-Allow-Origin header is not present on the requested resource
```

## Causa

O Google Apps Script não estava retornando os headers CORS necessários nas respostas, bloqueando as requisições vindas do domínio do Netlify.

## Solução Implementada

### 1. Novo Script com CORS

Foi criado o arquivo **google-apps-script-CORS-FINAL.js** com as seguintes correções:

- ✅ Headers CORS adicionados em todas as respostas
- ✅ Suporte para requisições OPTIONS (preflight)
- ✅ Função `createResponse()` otimizada
- ✅ Configuração correta de Access-Control-Allow-Origin

### 2. Configuração do .env

Adicionada a variável de ambiente no arquivo `.env`:

```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbz6BmO1rhI8LTRNzakiQ8ryL1cO2tAaNSFfWx9fh0ZFHqZ0b2FgW4WJxg19B8VC5WkH/exec
```

### 3. Ajuste no googleSheets.ts

O serviço foi atualizado para usar a URL configurada no `.env`.

## Próximos Passos

### VOCÊ PRECISA FAZER:

1. **Atualizar o Google Apps Script**
   - Abra o Google Apps Script do seu projeto
   - Substitua TODO o código pelo conteúdo de `google-apps-script-CORS-FINAL.js`
   - Salve o arquivo

2. **Criar Nova Implantação**
   - Clique em **Implantar** > **Nova implantação**
   - Configure como **Web app**
   - **Executar como**: Me (seu email)
   - **Quem tem acesso**: Anyone
   - Copie a **NOVA URL** gerada

3. **Atualizar a URL no .env**
   - Substitua o valor de `VITE_GOOGLE_SCRIPT_URL` pela nova URL
   - Salve o arquivo

4. **Rebuild e Deploy**
   ```bash
   npm run build
   ```
   - Faça commit e push para o repositório
   - O Netlify reimplantará automaticamente

## Verificação

Após seguir todos os passos, verifique:

1. Abra o console do navegador (F12)
2. Faça login na aplicação
3. **NÃO** deve haver erros CORS
4. Os dados devem carregar normalmente

## Arquivos Importantes

- `google-apps-script-CORS-FINAL.js` - Script atualizado com CORS
- `INSTRUCOES_ATUALIZAR_SCRIPT_CORS.md` - Instruções detalhadas
- `.env` - Configuração da URL do script

## Observações

- **IMPORTANTE**: A URL antiga não funcionará mais
- Você **PRECISA** criar uma nova implantação no Google Apps Script
- Limpe o cache do navegador após a atualização

## Status Atual

✅ Script corrigido e criado
✅ Configuração do .env atualizada
✅ Build do projeto executado com sucesso
⏳ **PENDENTE**: Você precisa atualizar o Google Apps Script e gerar nova URL
