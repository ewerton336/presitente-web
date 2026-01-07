namespace PresidenteGame.Models;

public enum PlayerRank
{
    Nada,           // Posição padrão
    Presidente,     // 1º a terminar
    VicePresidente, // 2º a terminar
    SubCu,          // Penúltimo a terminar
    Cu              // Último a terminar
}

public class Player
{
    public string Id { get; set; }
    public string ConnectionId { get; set; }
    public string Name { get; set; }
    public List<Card> Hand { get; set; }
    public PlayerRank Rank { get; set; }
    public bool HasFinished { get; set; }
    public int FinishPosition { get; set; } // Ordem em que terminou (0 = ainda jogando)
    public bool IsRoomCreator { get; set; }

    public Player(string connectionId, string name, bool isRoomCreator = false)
    {
        Id = Guid.NewGuid().ToString();
        ConnectionId = connectionId;
        Name = name;
        Hand = new List<Card>();
        Rank = PlayerRank.Nada;
        HasFinished = false;
        FinishPosition = 0;
        IsRoomCreator = isRoomCreator;
    }

    public void AddCard(Card card)
    {
        Hand.Add(card);
    }

    public void AddCards(IEnumerable<Card> cards)
    {
        Hand.AddRange(cards);
    }

    public void RemoveCard(Card card)
    {
        Hand.Remove(card);
    }

    public void RemoveCards(IEnumerable<Card> cards)
    {
        foreach (var card in cards)
        {
            Hand.Remove(card);
        }
    }

    public void ClearHand()
    {
        Hand.Clear();
    }

    public void SortHand()
    {
        Hand = Hand.OrderBy(c => c.Value).ThenBy(c => c.Suit).ToList();
    }
}

