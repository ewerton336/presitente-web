# 🃏 Jogo Presidente Online

Jogo de cartas online "Presidente/Cu" desenvolvido em React e .NET para jogar com a família.

## 📋 Requisitos

- Node.js 18+ e npm
- .NET 8.0 SDK
- Navegador web moderno

## 🚀 Como Executar

### Backend (.NET)

1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Compile e execute o servidor:
```bash
dotnet run --project PresidenteGame.Api
```

O servidor estará rodando em `http://localhost:5000`

### Frontend (React)

1. Em outro terminal, navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências (se ainda não instalou):
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 🎮 Como Jogar

1. Acesse o frontend no navegador
2. **Criar Sala**: Digite um nome para a sala e seu nome, clique em "Criar Sala"
3. **Entrar na Sala**: Use o código da sala e seu nome para entrar
4. Aguarde outros jogadores (mínimo 2, máximo 8)
5. O criador da sala pode iniciar o jogo
6. Siga as regras do jogo Presidente!

## 📖 Regras do Jogo

### Objetivo
Ser o primeiro a ficar sem cartas na mão e se tornar o Presidente!

### Mecânica Básica
- **Primeira partida**: Todos começam como "Nada" (classificatória)
- **Ordem das cartas**: Ás (mais fraco) até Rei (mais forte)
- **Jogadas**: Você pode jogar carta única, dupla, trio ou quadra
- **Sequência**: O próximo jogador deve jogar o mesmo tipo de combinação com valor maior
- **Passar**: Se não puder ou não quiser jogar, passe a vez
- **Rei**: Jogar um Rei sempre encerra a rodada

### Classificação
Após a primeira partida, os jogadores são classificados:
- 🥇 **Presidente**: Primeiro a terminar
- 🥈 **Vice-Presidente**: Segundo a terminar
- 😐 **Nada**: Jogadores do meio
- 🥉 **Sub-Cu**: Penúltimo a terminar
- 💩 **Cu**: Último a terminar

### Troca de Cartas (partidas seguintes)
- **Cu → Presidente**: Troca 2 cartas mais fortes por 2 mais fracas
- **Sub-Cu → Vice-Presidente**: Troca 1 carta mais forte por 1 mais fraca

### Baralhos
- 2-5 jogadores: 1 baralho (52 cartas)
- 6-8 jogadores: 2 baralhos (104 cartas)

## 🛠 Tecnologias

### Backend
- ASP.NET Core 8.0
- SignalR (comunicação em tempo real)
- C#

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- Vite
- React Router

## 📁 Estrutura do Projeto

```
presitente-web/
├── backend/
│   ├── PresidenteGame.Models/    # Modelos de dados
│   ├── PresidenteGame.Core/      # Lógica do jogo
│   └── PresidenteGame.Api/       # API e SignalR Hub
└── frontend/
    └── src/
        ├── components/           # Componentes React
        ├── services/             # Serviço SignalR
        └── types/                # TypeScript types
```

## 🎯 Funcionalidades

- ✅ Sistema de salas com códigos únicos
- ✅ Comunicação em tempo real via SignalR
- ✅ Suporte para 2-8 jogadores
- ✅ Interface visual intuitiva
- ✅ Todas as regras do jogo implementadas
- ✅ Sistema de classificação entre partidas
- ✅ Troca automática de cartas
- ✅ Validação completa de jogadas

## 📝 Notas

- O estado do jogo é mantido apenas em memória (será perdido ao reiniciar o servidor)
- Ideal para jogar em LAN ou com amigos em uma mesma rede
- Para jogar pela internet, será necessário configurar port forwarding ou hospedar em um servidor

## 🐛 Problemas Conhecidos

Se o backend não conectar, verifique:
1. Se a porta 5000 está disponível
2. Se o firewall não está bloqueando a conexão
3. Se a URL do SignalR no frontend (`gameService.ts`) está correta

## 🤝 Contribuindo

Este é um projeto simples para uso familiar. Sinta-se livre para modificar e adaptar às suas necessidades!

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente.

