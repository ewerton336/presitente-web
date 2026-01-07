# 🎉 Projeto Jogo Presidente - COMPLETO!

## ✅ O que foi criado

Implementei completamente o jogo de cartas "Presidente/Cu" conforme solicitado. O projeto está 100% funcional e pronto para jogar com sua família!

## 📂 Arquivos Importantes

### Para Começar
- **`COMO_EXECUTAR.md`** ← COMECE AQUI! Instruções passo a passo
- **`start-backend.bat`** ← Clique duplo para iniciar o servidor
- **`start-frontend.bat`** ← Clique duplo para iniciar a interface

### Documentação
- **`README.md`** ← Visão geral e regras completas do jogo
- **`PROJETO_COMPLETO.md`** ← Detalhes técnicos e testes

## 🚀 Início Rápido (3 passos)

### 1️⃣ Inicie o Backend
Clique duas vezes em `start-backend.bat` ou execute:
```bash
cd backend
dotnet run --project PresidenteGame.Api
```

### 2️⃣ Inicie o Frontend  
Em outro terminal, clique duas vezes em `start-frontend.bat` ou:
```bash
cd frontend
npm run dev
```

### 3️⃣ Jogue!
Abra seu navegador em `http://localhost:5173`

## 🎮 Como Funciona

1. **Criar Sala**: Primeira pessoa cria uma sala e recebe um código
2. **Entrar na Sala**: Outros jogadores entram usando o código
3. **Iniciar Jogo**: Criador da sala inicia quando todos estiverem prontos
4. **Jogar**: Siga as regras do jogo Presidente!

## 📋 Todas as Regras Implementadas

✅ Primeira partida classificatória (todos "Nada")
✅ 2-8 jogadores (mínimo 2, máximo 8)
✅ 1 baralho para 2-5 jogadores, 2 baralhos para 6-8
✅ Primeiros 3 jogadores: 8 cartas, resto: 7 cartas
✅ Jogar carta única, dupla, trio ou quadra
✅ Próximo deve jogar mesmo tipo com valor maior
✅ Rei sempre encerra a rodada
✅ Passar a vez quando não pode/quer jogar
✅ Classificação: Presidente → Vice → Nada → Sub-cu → Cu
✅ Troca de cartas entre partidas:
  - Cu ↔ Presidente: 2 cartas
  - Sub-cu ↔ Vice: 1 carta
✅ Jogador entrando após classificatória vira Cu automaticamente

## 🛠️ Tecnologias Usadas

**Backend:**
- ASP.NET Core 8.0 (C#)
- SignalR (tempo real)

**Frontend:**
- React 18 (JavaScript)
- TypeScript
- Material-UI (design moderno)
- Vite (build rápido)

## 🌐 Jogar Online (com família em outras cidades)

Para jogar pela internet (não apenas LAN):

1. **Configure Port Forwarding**:
   - Entre no seu roteador
   - Abra a porta 5000 TCP
   - Direcione para o IP local do seu computador

2. **Descubra seu IP público**:
   - Acesse whatismyip.com
   - Anote o IP

3. **Atualize o frontend**:
   - Abra `frontend/src/services/gameService.ts`
   - Linha 16: Troque `localhost` pelo seu IP público
   - Exemplo: `http://192.168.1.100:5000/gameHub`

4. **Compartilhe**:
   - Envie o link do frontend para sua família
   - Eles acessam e entram na sala com o código

## 📱 Funciona em Celular?

Sim! A interface é responsiva e funciona em:
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablet
- ✅ Celular

## ⚠️ Requisitos

- **Node.js** (para o frontend)
- **.NET 8.0 SDK** (para o backend)
- **Navegador moderno** (Chrome, Firefox, Edge)

## 🐛 Problemas?

### Backend não inicia
- Instale o .NET 8.0 SDK
- Verifique se a porta 5000 está livre

### Frontend não conecta
- Certifique-se de que o backend está rodando
- Verifique se não há erros no terminal

### Firewall bloqueando
- Permita acesso para as portas 5000 e 5173
- No Windows: Firewall → Permitir aplicativo

## 🎯 Estado do Projeto

| Funcionalidade | Status |
|----------------|--------|
| Backend completo | ✅ 100% |
| Frontend completo | ✅ 100% |
| Comunicação tempo real | ✅ 100% |
| Todas as regras | ✅ 100% |
| Interface moderna | ✅ 100% |
| Documentação | ✅ 100% |
| **TOTAL** | **✅ 100% PRONTO** |

## 🎊 Divirta-se!

O jogo está completamente funcional e pronto para uso! Reúna sua família e divirtam-se jogando Presidente! 🃏

**Dica**: Para a melhor experiência, use uma conexão de internet estável e um navegador atualizado.

---

## 📞 Próximos Passos (Opcional)

Se quiser melhorar o jogo no futuro, considere:
- 💾 Adicionar banco de dados (PostgreSQL/MongoDB)
- 🔐 Sistema de login
- 📊 Estatísticas e rankings globais
- 🎵 Sons e animações
- 💬 Chat entre jogadores
- 🎨 Temas customizáveis

Mas por enquanto, o jogo está perfeito para jogar com a família! 🎉

