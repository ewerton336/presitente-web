using Microsoft.AspNetCore.SignalR;
using PresidenteGame.Core;
using PresidenteGame.Models;

namespace PresidenteGame.Api.Hubs;

public class GameHub : Hub
{
    private readonly RoomManager _roomManager;
    private readonly GameEngine _gameEngine;

    public GameHub(RoomManager roomManager, GameEngine gameEngine)
    {
        _roomManager = roomManager;
        _gameEngine = gameEngine;
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
        if (room != null)
        {
            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player != null)
            {
                room.RemovePlayer(Context.ConnectionId);
                
                // Notifica os outros jogadores
                await Clients.Group(room.Id).SendAsync("PlayerLeft", new
                {
                    playerId = player.Id,
                    playerName = player.Name,
                    remainingPlayers = room.GameState.Players.Count
                });

                // Se não sobrou ninguém, remove a sala
                if (room.GameState.Players.Count == 0)
                {
                    _roomManager.RemoveRoom(room.Id);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task<object> CreateRoom(string roomName)
    {
        try
        {
            var room = _roomManager.CreateRoom(roomName, Context.ConnectionId);
            await Groups.AddToGroupAsync(Context.ConnectionId, room.Id);

            return new
            {
                success = true,
                roomId = room.Id,
                roomName = room.Name
            };
        }
        catch (Exception ex)
        {
            return new
            {
                success = false,
                error = ex.Message
            };
        }
    }

    public async Task<object> JoinRoom(string roomId, string playerName)
    {
        try
        {
            // Normaliza o roomId para maiúsculas
            var normalizedRoomId = roomId?.ToUpperInvariant() ?? "";
            
            var room = _roomManager.GetRoom(normalizedRoomId);
            if (room == null)
            {
                return new { success = false, error = "Sala não encontrada." };
            }

            if (room.IsFull())
            {
                return new { success = false, error = "Sala está cheia." };
            }

            // Verifica se já existe um jogador com este connection ID
            var existingPlayer = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (existingPlayer != null)
            {
                // Se já está na sala, apenas reenvia o estado
                var isExistingCreator = room.CreatorConnectionId == Context.ConnectionId;
                await Clients.Caller.SendAsync("RoomState", new
                {
                    roomId = room.Id,
                    roomName = room.Name,
                    players = room.GameState.Players.Select(p => new
                    {
                        id = p.Id,
                        name = p.Name,
                        rank = p.Rank.ToString(),
                        isRoomCreator = p.IsRoomCreator,
                        hasFinished = p.HasFinished
                    }),
                    phase = room.GameState.Phase.ToString(),
                    canStart = room.CanStart(),
                    isCreator = isExistingCreator
                });
                
                return new { success = true };
            }

            // Adiciona o jogador à sala
            var isCreator = room.CreatorConnectionId == Context.ConnectionId;
            var player = new Player(Context.ConnectionId, playerName, isCreator);
            
            // Se o jogo já passou da primeira partida, aplica a regra especial
            if (!room.GameState.IsFirstGame && room.GameState.Phase != GamePhase.WaitingForPlayers)
            {
                _gameEngine.HandlePlayerJoinAfterFirstGame(room.GameState, player);
            }

            room.GameState.Players.Add(player);
            room.UpdateActivity();

            await Groups.AddToGroupAsync(Context.ConnectionId, normalizedRoomId);

            // Notifica todos os jogadores sobre o novo jogador
            await Clients.Group(normalizedRoomId).SendAsync("PlayerJoined", new
            {
                player = new
                {
                    id = player.Id,
                    name = player.Name,
                    rank = player.Rank.ToString(),
                    isRoomCreator = player.IsRoomCreator
                },
                totalPlayers = room.GameState.Players.Count
            });

            // Envia o estado atual da sala para o novo jogador
            await Clients.Caller.SendAsync("RoomState", new
            {
                roomId = room.Id,
                roomName = room.Name,
                players = room.GameState.Players.Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    rank = p.Rank.ToString(),
                    isRoomCreator = p.IsRoomCreator,
                    hasFinished = p.HasFinished
                }),
                phase = room.GameState.Phase.ToString(),
                canStart = room.CanStart(),
                isCreator = isCreator
            });

            return new { success = true };
        }
        catch (Exception ex)
        {
            return new { success = false, error = ex.Message };
        }
    }

    public async Task<object> StartGame()
    {
        try
        {
            var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
            if (room == null)
            {
                return new { success = false, error = "Você não está em uma sala." };
            }

            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player == null || !player.IsRoomCreator)
            {
                return new { success = false, error = "Apenas o criador da sala pode iniciar o jogo." };
            }

            if (!room.CanStart())
            {
                return new { success = false, error = "Não é possível iniciar o jogo agora." };
            }

            _gameEngine.StartGame(room);

            // Notifica todos os jogadores que o jogo começou
            foreach (var p in room.GameState.Players)
            {
                await Clients.Client(p.ConnectionId).SendAsync("GameStarted", new
                {
                    gameNumber = room.GameState.GameNumber,
                    isFirstGame = room.GameState.IsFirstGame,
                    yourCards = p.Hand.Select(c => new
                    {
                        id = c.Id,
                        value = c.Value.ToString(),
                        suit = c.Suit.ToString()
                    }),
                    currentPlayer = new
                    {
                        id = room.GameState.GetCurrentPlayer()?.Id,
                        name = room.GameState.GetCurrentPlayer()?.Name
                    },
                    players = room.GameState.Players.Select(pl => new
                    {
                        id = pl.Id,
                        name = pl.Name,
                        rank = pl.Rank.ToString(),
                        cardCount = pl.Hand.Count
                    })
                });
            }

            return new { success = true };
        }
        catch (Exception ex)
        {
            return new { success = false, error = ex.Message };
        }
    }

    public async Task<object> PlayCards(List<string> cardIds)
    {
        try
        {
            var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
            if (room == null)
            {
                return new { success = false, error = "Você não está em uma sala." };
            }

            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player == null)
            {
                return new { success = false, error = "Jogador não encontrado." };
            }

            // Valida a jogada
            var (isValid, errorMessage) = _gameEngine.ValidatePlay(room.GameState, player, cardIds);
            if (!isValid)
            {
                return new { success = false, error = errorMessage };
            }

            // Executa a jogada
            _gameEngine.ExecutePlay(room.GameState, player, cardIds);
            room.UpdateActivity();

            var cards = player.Hand.Where(c => cardIds.Contains(c.Id)).ToList();
            if (cards.Count == 0)
            {
                // As cartas já foram removidas, então pegamos da última jogada
                cards = room.GameState.LastPlay?.Cards ?? new List<Card>();
            }

            // Notifica todos os jogadores sobre a jogada
            await Clients.Group(room.Id).SendAsync("PlayerPlayed", new
            {
                playerId = player.Id,
                playerName = player.Name,
                cards = room.GameState.LastPlay?.Cards.Select(c => new
                {
                    id = c.Id,
                    value = c.Value.ToString(),
                    suit = c.Suit.ToString()
                }),
                playType = room.GameState.LastPlay?.Type.ToString(),
                playerCardCount = player.Hand.Count,
                currentPlayer = new
                {
                    id = room.GameState.GetCurrentPlayer()?.Id,
                    name = room.GameState.GetCurrentPlayer()?.Name
                },
                phase = room.GameState.Phase.ToString()
            });

            // Se o jogador terminou
            if (player.HasFinished)
            {
                await Clients.Group(room.Id).SendAsync("PlayerFinished", new
                {
                    playerId = player.Id,
                    playerName = player.Name,
                    position = player.FinishPosition
                });
            }

            // Se o jogo terminou
            if (room.GameState.Phase == GamePhase.GameFinished)
            {
                await Clients.Group(room.Id).SendAsync("GameFinished", new
                {
                    rankings = room.GameState.Players.OrderBy(p => p.FinishPosition).Select(p => new
                    {
                        id = p.Id,
                        name = p.Name,
                        rank = p.Rank.ToString(),
                        position = p.FinishPosition
                    })
                });
            }

            return new { success = true };
        }
        catch (Exception ex)
        {
            return new { success = false, error = ex.Message };
        }
    }

    public async Task<object> Pass()
    {
        try
        {
            var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
            if (room == null)
            {
                return new { success = false, error = "Você não está em uma sala." };
            }

            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player == null)
            {
                return new { success = false, error = "Jogador não encontrado." };
            }

            var currentPlayer = room.GameState.GetCurrentPlayer();
            if (currentPlayer?.Id != player.Id)
            {
                return new { success = false, error = "Não é sua vez de jogar." };
            }

            // Se não há jogada anterior, não pode passar
            if (room.GameState.LastPlay == null)
            {
                return new { success = false, error = "Você não pode passar na primeira jogada da rodada." };
            }

            _gameEngine.ExecutePass(room.GameState);
            room.UpdateActivity();

            // Notifica todos os jogadores
            await Clients.Group(room.Id).SendAsync("PlayerPassed", new
            {
                playerId = player.Id,
                playerName = player.Name,
                currentPlayer = new
                {
                    id = room.GameState.GetCurrentPlayer()?.Id,
                    name = room.GameState.GetCurrentPlayer()?.Name
                }
            });

            // Se iniciou uma nova rodada
            if (room.GameState.LastPlay == null)
            {
                await Clients.Group(room.Id).SendAsync("NewRound", new
                {
                    winnerId = room.GameState.RoundWinnerId,
                    currentPlayer = new
                    {
                        id = room.GameState.GetCurrentPlayer()?.Id,
                        name = room.GameState.GetCurrentPlayer()?.Name
                    }
                });
            }

            return new { success = true };
        }
        catch (Exception ex)
        {
            return new { success = false, error = ex.Message };
        }
    }

    public async Task<object> StartNextGame()
    {
        try
        {
            var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
            if (room == null)
            {
                return new { success = false, error = "Você não está em uma sala." };
            }

            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player == null || !player.IsRoomCreator)
            {
                return new { success = false, error = "Apenas o criador da sala pode iniciar a próxima partida." };
            }

            if (room.GameState.Phase != GamePhase.GameFinished)
            {
                return new { success = false, error = "A partida atual ainda não terminou." };
            }

            _gameEngine.PrepareNextGame(room);
            _gameEngine.StartGame(room);

            // Notifica todos os jogadores
            foreach (var p in room.GameState.Players)
            {
                await Clients.Client(p.ConnectionId).SendAsync("GameStarted", new
                {
                    gameNumber = room.GameState.GameNumber,
                    isFirstGame = room.GameState.IsFirstGame,
                    yourCards = p.Hand.Select(c => new
                    {
                        id = c.Id,
                        value = c.Value.ToString(),
                        suit = c.Suit.ToString()
                    }),
                    currentPlayer = new
                    {
                        id = room.GameState.GetCurrentPlayer()?.Id,
                        name = room.GameState.GetCurrentPlayer()?.Name
                    },
                    players = room.GameState.Players.Select(pl => new
                    {
                        id = pl.Id,
                        name = pl.Name,
                        rank = pl.Rank.ToString(),
                        cardCount = pl.Hand.Count
                    })
                });
            }

            return new { success = true };
        }
        catch (Exception ex)
        {
            return new { success = false, error = ex.Message };
        }
    }
}

