using PresidenteGame.Models;

namespace PresidenteGame.Core;

public class DeckManager
{
    public static List<Card> CreateDeck(int numberOfDecks = 1)
    {
        var deck = new List<Card>();

        for (int deckIndex = 0; deckIndex < numberOfDecks; deckIndex++)
        {
            foreach (Suit suit in Enum.GetValues(typeof(Suit)))
            {
                foreach (CardValue value in Enum.GetValues(typeof(CardValue)))
                {
                    deck.Add(new Card(value, suit));
                }
            }
        }

        return deck;
    }

    public static void Shuffle(List<Card> deck)
    {
        var random = new Random();
        int n = deck.Count;
        
        while (n > 1)
        {
            n--;
            int k = random.Next(n + 1);
            (deck[k], deck[n]) = (deck[n], deck[k]);
        }
    }

    public static int DetermineNumberOfDecks(int playerCount)
    {
        // 2-5 jogadores: 1 baralho
        // 6-8 jogadores: 2 baralhos
        return playerCount >= 6 ? 2 : 1;
    }

    public static List<List<Card>> DistributeCards(List<Card> deck, int playerCount)
    {
        var hands = new List<List<Card>>();
        
        // Inicializa as mãos
        for (int i = 0; i < playerCount; i++)
        {
            hands.Add(new List<Card>());
        }

        // Distribui as cartas em círculo
        int cardIndex = 0;

        // Primeiros 3 jogadores recebem 8 cartas, resto recebe 7
        int[] cardsPerPlayer = new int[playerCount];
        for (int i = 0; i < playerCount; i++)
        {
            cardsPerPlayer[i] = i < 3 ? 8 : 7;
        }

        // Distribui as cartas
        for (int player = 0; player < playerCount; player++)
        {
            for (int card = 0; card < cardsPerPlayer[player]; card++)
            {
                if (cardIndex < deck.Count)
                {
                    hands[player].Add(deck[cardIndex]);
                    cardIndex++;
                }
            }
        }

        return hands;
    }
}

