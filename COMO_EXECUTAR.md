# 🚀 Como Executar o Jogo Presidente

## Passo 1: Iniciar o Backend

Abra um terminal e execute:

```bash
cd backend
dotnet run --project PresidenteGame.Api
```

O servidor estará rodando em `http://localhost:5000`

> ⚠️ **Importante**: Mantenha este terminal aberto enquanto joga!

## Passo 2: Iniciar o Frontend

Abra **outro terminal** (o primeiro deve continuar aberto) e execute:

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

> ⚠️ **Importante**: Mantenha este terminal também aberto!

## Passo 3: Jogar!

1. Abra seu navegador em `http://localhost:5173`
2. Crie uma sala ou entre em uma sala existente
3. Compartilhe o código da sala com seus familiares
4. Aguarde os jogadores entrarem (mínimo 2, máximo 8)
5. O criador da sala pode iniciar o jogo
6. Divirta-se! 🃏

## Jogar com Amigos em Outras Cidades

Para jogar com pessoas em outras redes, você precisará:

1. **Descobrir seu IP público**: Use um site como `whatismyip.com`
2. **Configurar port forwarding no seu roteador**: 
   - Porta 5000 (backend)
   - Direcionar para o IP local do seu computador
3. **Atualizar o frontend**:
   - No arquivo `frontend/src/services/gameService.ts`
   - Linha 16: Trocar `http://localhost:5000` por `http://SEU_IP_PUBLICO:5000`
4. **Compartilhar o link** do frontend com seus amigos

## Problemas Comuns

### Backend não inicia
- Verifique se tem o .NET 8.0 SDK instalado: `dotnet --version`
- Certifique-se de que a porta 5000 não está em uso

### Frontend não conecta
- Verifique se o backend está rodando
- Confirme que a URL no `gameService.ts` está correta
- Verifique se o firewall não está bloqueando a conexão

### Erro de CORS
- Certifique-se de que está acessando via `localhost` ou `127.0.0.1`
- Se estiver usando um IP diferente, adicione-o na configuração CORS do backend

## Dicas

- Use Google Chrome ou Edge para melhor compatibilidade
- Conexões mais rápidas resultam em melhor experiência
- Para jogar localmente, não é necessário internet
- Para jogar online, conexão estável é importante

## Suporte

Se encontrar problemas, verifique:
1. Ambos os terminais estão rodando
2. Não há erros nos terminais
3. Está usando as portas corretas
4. Seu firewall não está bloqueando as conexões

