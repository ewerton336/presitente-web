namespace PresidenteGame.Models;

public enum GamePhase
{
    WaitingForPlayers,  // Aguardando jogadores
    CardExchange,       // Fase de troca de cartas
    Playing,            // Jogando
    RoundFinished,      // Rodada terminou
    GameFinished        // Partida terminou
}

public class GameState
{
    public string RoomId { get; set; }
    public GamePhase Phase { get; set; }
    public List<Player> Players { get; set; }
    public int CurrentPlayerIndex { get; set; }
    public CardPlay? LastPlay { get; set; }
    public List<CardPlay> CurrentRoundPlays { get; set; }
    public int ConsecutivePasses { get; set; }
    public bool IsFirstGame { get; set; }
    public int NumberOfDecks { get; set; }
    public int GameNumber { get; set; }
    public string? RoundWinnerId { get; set; }

    public GameState(string roomId)
    {
        RoomId = roomId;
        Phase = GamePhase.WaitingForPlayers;
        Players = new List<Player>();
        CurrentPlayerIndex = 0;
        CurrentRoundPlays = new List<CardPlay>();
        ConsecutivePasses = 0;
        IsFirstGame = true;
        NumberOfDecks = 1;
        GameNumber = 0;
    }

    public Player? GetCurrentPlayer()
    {
        if (Players.Count == 0 || CurrentPlayerIndex >= Players.Count)
            return null;
        
        var activePlayers = Players.Where(p => !p.HasFinished).ToList();
        if (activePlayers.Count == 0)
            return null;

        return activePlayers[CurrentPlayerIndex % activePlayers.Count];
    }

    public void NextPlayer()
    {
        var activePlayers = Players.Where(p => !p.HasFinished).ToList();
        if (activePlayers.Count <= 1)
            return;

        CurrentPlayerIndex = (CurrentPlayerIndex + 1) % activePlayers.Count;
        
        // Pula jogadores que já terminaram
        while (GetCurrentPlayer()?.HasFinished == true)
        {
            CurrentPlayerIndex = (CurrentPlayerIndex + 1) % activePlayers.Count;
        }
    }

    public void StartNewRound()
    {
        CurrentRoundPlays.Clear();
        LastPlay = null;
        ConsecutivePasses = 0;
        
        // Se tem um vencedor da rodada anterior, ele começa
        if (!string.IsNullOrEmpty(RoundWinnerId))
        {
            var winnerIndex = Players.FindIndex(p => p.Id == RoundWinnerId);
            if (winnerIndex >= 0)
            {
                CurrentPlayerIndex = winnerIndex;
            }
        }
    }

    public bool IsGameFinished()
    {
        // Jogo termina quando todos menos 1 jogador terminaram
        var playersStillPlaying = Players.Count(p => !p.HasFinished);
        return playersStillPlaying <= 1;
    }

    public void CalculateRanks()
    {
        var finishedPlayers = Players.Where(p => p.HasFinished).OrderBy(p => p.FinishPosition).ToList();
        
        if (finishedPlayers.Count >= 1)
            finishedPlayers[0].Rank = PlayerRank.Presidente;
        
        if (finishedPlayers.Count >= 2)
            finishedPlayers[1].Rank = PlayerRank.VicePresidente;
        
        if (finishedPlayers.Count >= 3)
        {
            // Sub-cu é o penúltimo
            finishedPlayers[finishedPlayers.Count - 2].Rank = PlayerRank.SubCu;
        }
        
        if (finishedPlayers.Count >= 2)
        {
            // Cu é o último
            finishedPlayers[finishedPlayers.Count - 1].Rank = PlayerRank.Cu;
        }
        
        // Os que não terminaram ou estão no meio são "Nada"
        foreach (var player in Players.Where(p => !p.HasFinished || 
            (p.Rank != PlayerRank.Presidente && 
             p.Rank != PlayerRank.VicePresidente && 
             p.Rank != PlayerRank.SubCu && 
             p.Rank != PlayerRank.Cu)))
        {
            player.Rank = PlayerRank.Nada;
        }
    }
}

