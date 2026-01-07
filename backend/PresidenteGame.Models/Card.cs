namespace PresidenteGame.Models;

public enum Suit
{
    Hearts,    // Copas
    Diamonds,  // Ouros
    Clubs,     // Paus
    Spades     // Espadas
}

public enum CardValue
{
    Ace = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13
}

public class Card
{
    public string Id { get; set; }
    public CardValue Value { get; set; }
    public Suit Suit { get; set; }

    public Card(CardValue value, Suit suit)
    {
        Id = Guid.NewGuid().ToString();
        Value = value;
        Suit = suit;
    }

    public override string ToString()
    {
        return $"{Value} of {Suit}";
    }

    public override bool Equals(object? obj)
    {
        if (obj is Card other)
        {
            return Id == other.Id;
        }
        return false;
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
}

