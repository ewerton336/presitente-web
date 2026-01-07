namespace PresidenteGame.Models;

public enum PlayType
{
    Single = 1,   // Carta única
    Double = 2,   // Dupla
    Triple = 3,   // Trio
    Quadruple = 4 // Quadra
}

public class CardPlay
{
    public string PlayerId { get; set; }
    public string PlayerName { get; set; }
    public List<Card> Cards { get; set; }
    public PlayType Type { get; set; }
    public CardValue Value { get; set; }
    public DateTime Timestamp { get; set; }

    public CardPlay(string playerId, string playerName, List<Card> cards)
    {
        PlayerId = playerId;
        PlayerName = playerName;
        Cards = cards;
        Type = (PlayType)cards.Count;
        Value = cards.First().Value;
        Timestamp = DateTime.UtcNow;
    }

    public bool IsValid()
    {
        // Verifica se todas as cartas têm o mesmo valor
        return Cards.All(c => c.Value == Cards.First().Value);
    }

    public bool IsHigherThan(CardPlay? other)
    {
        if (other == null) return true;
        
        // Tipo de jogada deve ser igual
        if (Type != other.Type) return false;
        
        // Verifica se o valor é maior
        return Value > other.Value;
    }
}

