using PresidenteGame.Models;

namespace PresidenteGame.Core;

public class GameEngine
{
    public void StartGame(Room room)
    {
        var gameState = room.GameState;
        
        // Determina número de baralhos baseado na quantidade de jogadores
        gameState.NumberOfDecks = DeckManager.DetermineNumberOfDecks(gameState.Players.Count);
        
        // Cria e embaralha o baralho
        var deck = DeckManager.CreateDeck(gameState.NumberOfDecks);
        DeckManager.Shuffle(deck);
        
        // Distribui as cartas
        var hands = DeckManager.DistributeCards(deck, gameState.Players.Count);
        
        // Atribui as cartas aos jogadores
        for (int i = 0; i < gameState.Players.Count; i++)
        {
            gameState.Players[i].ClearHand();
            gameState.Players[i].AddCards(hands[i]);
            gameState.Players[i].SortHand();
            gameState.Players[i].HasFinished = false;
            gameState.Players[i].FinishPosition = 0;
        }
        
        // Se não é o primeiro jogo, faz a troca de cartas
        if (!gameState.IsFirstGame)
        {
            gameState.Phase = GamePhase.CardExchange;
            PerformCardExchange(gameState);
        }
        
        // Define o primeiro jogador (o primeiro que recebeu cartas)
        gameState.CurrentPlayerIndex = 0;
        gameState.Phase = GamePhase.Playing;
        gameState.GameNumber++;
        gameState.StartNewRound();
        
        room.UpdateActivity();
    }

    private void PerformCardExchange(GameState gameState)
    {
        var presidente = gameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.Presidente);
        var vice = gameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.VicePresidente);
        var subCu = gameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.SubCu);
        var cu = gameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.Cu);

        // Cu troca 2 cartas mais fortes com 2 cartas mais fracas do Presidente
        if (cu != null && presidente != null)
        {
            var cuStrongest = cu.Hand.OrderByDescending(c => c.Value).Take(2).ToList();
            var presidenteWeakest = presidente.Hand.OrderBy(c => c.Value).Take(2).ToList();

            foreach (var card in cuStrongest)
            {
                cu.RemoveCard(card);
                presidente.AddCard(card);
            }

            foreach (var card in presidenteWeakest)
            {
                presidente.RemoveCard(card);
                cu.AddCard(card);
            }

            cu.SortHand();
            presidente.SortHand();
        }

        // Sub-cu troca 1 carta mais forte com 1 carta mais fraca do Vice
        if (subCu != null && vice != null)
        {
            var subCuStrongest = subCu.Hand.OrderByDescending(c => c.Value).FirstOrDefault();
            var viceWeakest = vice.Hand.OrderBy(c => c.Value).FirstOrDefault();

            if (subCuStrongest != null && viceWeakest != null)
            {
                subCu.RemoveCard(subCuStrongest);
                vice.AddCard(subCuStrongest);

                vice.RemoveCard(viceWeakest);
                subCu.AddCard(viceWeakest);

                subCu.SortHand();
                vice.SortHand();
            }
        }
    }

    public (bool isValid, string errorMessage) ValidatePlay(GameState gameState, Player player, List<string> cardIds)
    {
        // Verifica se é a vez do jogador
        var currentPlayer = gameState.GetCurrentPlayer();
        if (currentPlayer?.Id != player.Id)
        {
            return (false, "Não é sua vez de jogar.");
        }

        // Verifica se o jogador possui todas as cartas
        var cards = player.Hand.Where(c => cardIds.Contains(c.Id)).ToList();
        if (cards.Count != cardIds.Count)
        {
            return (false, "Você não possui todas as cartas selecionadas.");
        }

        if (cards.Count == 0 || cards.Count > 4)
        {
            return (false, "Você deve jogar de 1 a 4 cartas.");
        }

        // Verifica se todas as cartas têm o mesmo valor
        if (!cards.All(c => c.Value == cards.First().Value))
        {
            return (false, "Todas as cartas devem ter o mesmo valor.");
        }

        var play = new CardPlay(player.Id, player.Name, cards);

        // Se é a primeira jogada da rodada, qualquer jogada válida é aceita
        if (gameState.LastPlay == null)
        {
            return (true, string.Empty);
        }

        // Verifica se o tipo de jogada é o mesmo
        if (play.Type != gameState.LastPlay.Type)
        {
            return (false, $"Você deve jogar {(int)gameState.LastPlay.Type} carta(s).");
        }

        // Verifica se o valor é maior
        if (!play.IsHigherThan(gameState.LastPlay))
        {
            return (false, "Você deve jogar cartas de valor maior.");
        }

        return (true, string.Empty);
    }

    public void ExecutePlay(GameState gameState, Player player, List<string> cardIds)
    {
        var cards = player.Hand.Where(c => cardIds.Contains(c.Id)).ToList();
        var play = new CardPlay(player.Id, player.Name, cards);

        // Remove as cartas da mão do jogador
        player.RemoveCards(cards);

        // Atualiza o estado do jogo
        gameState.LastPlay = play;
        gameState.CurrentRoundPlays.Add(play);
        gameState.ConsecutivePasses = 0;

        // Verifica se o jogador terminou
        if (player.Hand.Count == 0)
        {
            player.HasFinished = true;
            var finishedCount = gameState.Players.Count(p => p.HasFinished);
            player.FinishPosition = finishedCount;
        }

        // Se jogou um Rei, a rodada termina
        if (play.Value == CardValue.King)
        {
            gameState.RoundWinnerId = player.Id;
            gameState.StartNewRound();
            return;
        }

        // Verifica se o jogo terminou
        if (gameState.IsGameFinished())
        {
            FinishGame(gameState);
            return;
        }

        // Se o jogador terminou, pula para o próximo
        if (player.HasFinished)
        {
            gameState.NextPlayer();
        }
        else
        {
            gameState.NextPlayer();
        }
    }

    public void ExecutePass(GameState gameState)
    {
        gameState.ConsecutivePasses++;
        
        var activePlayers = gameState.Players.Count(p => !p.HasFinished);
        
        // Se todos os jogadores ativos (exceto o último que jogou) passaram, nova rodada
        if (gameState.ConsecutivePasses >= activePlayers - 1)
        {
            // O último que jogou ganha a rodada
            if (gameState.LastPlay != null)
            {
                gameState.RoundWinnerId = gameState.LastPlay.PlayerId;
            }
            gameState.StartNewRound();
        }
        else
        {
            gameState.NextPlayer();
        }
    }

    private void FinishGame(GameState gameState)
    {
        // Marca o último jogador restante
        var lastPlayer = gameState.Players.FirstOrDefault(p => !p.HasFinished);
        if (lastPlayer != null)
        {
            lastPlayer.HasFinished = true;
            lastPlayer.FinishPosition = gameState.Players.Count;
        }

        gameState.CalculateRanks();
        gameState.Phase = GamePhase.GameFinished;
        gameState.IsFirstGame = false;
    }

    public void HandlePlayerJoinAfterFirstGame(GameState gameState, Player newPlayer)
    {
        // Quando um jogador conecta após a partida classificatória
        if (!gameState.IsFirstGame)
        {
            var cu = gameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.Cu);
            var subCu = gameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.SubCu);

            // Novo jogador vira Cu
            newPlayer.Rank = PlayerRank.Cu;

            // Cu vira Sub-cu
            if (cu != null)
            {
                cu.Rank = PlayerRank.SubCu;
            }

            // Sub-cu vira Nada
            if (subCu != null)
            {
                subCu.Rank = PlayerRank.Nada;
            }
        }
    }

    public void PrepareNextGame(Room room)
    {
        var gameState = room.GameState;
        gameState.Phase = GamePhase.WaitingForPlayers;
        gameState.LastPlay = null;
        gameState.CurrentRoundPlays.Clear();
        gameState.ConsecutivePasses = 0;
        gameState.RoundWinnerId = null;
        
        // Mantém os ranks dos jogadores para a próxima partida
        // mas reseta o estado de finalização
        foreach (var player in gameState.Players)
        {
            player.HasFinished = false;
            player.FinishPosition = 0;
        }
    }
}

