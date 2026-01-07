namespace PresidenteGame.Models;

public class Room
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string CreatorConnectionId { get; set; }
    public GameState GameState { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastActivityAt { get; set; }
    public int MaxPlayers { get; set; }

    public Room(string name, string creatorConnectionId)
    {
        Id = GenerateRoomCode();
        Name = name;
        CreatorConnectionId = creatorConnectionId;
        GameState = new GameState(Id);
        CreatedAt = DateTime.UtcNow;
        LastActivityAt = DateTime.UtcNow;
        MaxPlayers = 8;
    }

    private static string GenerateRoomCode()
    {
        // Gera um código de sala de 6 caracteres
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    public bool CanStart()
    {
        var canStart = GameState.Players.Count >= 2 && 
                       GameState.Players.Count <= MaxPlayers &&
                       GameState.Phase == GamePhase.WaitingForPlayers;
        
        Console.WriteLine($"[Room.CanStart] RoomId={Id}, Players={GameState.Players.Count}, Phase={GameState.Phase}, CanStart={canStart}");
        
        return canStart;
    }

    public bool IsFull()
    {
        return GameState.Players.Count >= MaxPlayers;
    }

    public void UpdateActivity()
    {
        LastActivityAt = DateTime.UtcNow;
    }

    public Player? GetPlayerByConnectionId(string connectionId)
    {
        return GameState.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
    }

    public void RemovePlayer(string connectionId)
    {
        var player = GetPlayerByConnectionId(connectionId);
        if (player != null)
        {
            GameState.Players.Remove(player);
        }
    }
}

