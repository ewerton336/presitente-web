using Microsoft.AspNetCore.SignalR;
using PresidenteGame.Core;
using PresidenteGame.Models;

namespace PresidenteGame.Api.Hubs;

public class GameHub : Hub
{
    private readonly RoomManager _roomManager;
    private readonly GameEngine _gameEngine;
    private readonly ILogger<GameHub> _logger;

    public GameHub(RoomManager roomManager, GameEngine gameEngine, ILogger<GameHub> logger)
    {
        _roomManager = roomManager;
        _gameEngine = gameEngine;
        _logger = logger;
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("OnDisconnectedAsync: Conexão {ConnectionId} desconectada", Context.ConnectionId);

        if (exception != null)
        {
            _logger.LogWarning(exception, "OnDisconnectedAsync: Desconexão com exceção para {ConnectionId}", Context.ConnectionId);
        }

        var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
        if (room != null)
        {
            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player != null)
            {
                _logger.LogInformation("OnDisconnectedAsync: Removendo jogador '{PlayerName}' da sala '{RoomId}'", player.Name, room.Id);
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
                    _logger.LogInformation("OnDisconnectedAsync: Sala '{RoomId}' vazia, removendo...", room.Id);
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
            _logger.LogInformation("CreateRoom: Tentando criar sala '{RoomName}' para conexão {ConnectionId}", roomName, Context.ConnectionId);

            var room = _roomManager.CreateRoom(roomName, Context.ConnectionId);
            await Groups.AddToGroupAsync(Context.ConnectionId, room.Id);

            _logger.LogInformation("CreateRoom: Sala '{RoomId}' criada com sucesso por {ConnectionId}", room.Id, Context.ConnectionId);

            return new
            {
                success = true,
                roomId = room.Id,
                roomName = room.Name
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreateRoom: Erro ao criar sala '{RoomName}' para conexão {ConnectionId}", roomName, Context.ConnectionId);
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
            _logger.LogInformation("JoinRoom: Jogador '{PlayerName}' tentando entrar na sala '{RoomId}' (conexão: {ConnectionId})", playerName, roomId, Context.ConnectionId);

            // Normaliza o roomId para maiúsculas
            var normalizedRoomId = roomId?.ToUpperInvariant() ?? "";

            _logger.LogInformation("JoinRoom: RoomId normalizado: '{NormalizedRoomId}'", normalizedRoomId);

            var room = _roomManager.GetRoom(normalizedRoomId);
            if (room == null)
            {
                _logger.LogWarning("JoinRoom: Sala '{RoomId}' não encontrada para jogador '{PlayerName}'", normalizedRoomId, playerName);
                return new { success = false, error = "Sala não encontrada." };
            }

            if (room.IsFull())
            {
                _logger.LogWarning("JoinRoom: Sala '{RoomId}' está cheia. Jogador '{PlayerName}' não pode entrar", normalizedRoomId, playerName);
                return new { success = false, error = "Sala está cheia." };
            }

            // Verifica se já existe um jogador com este connection ID
            var existingPlayer = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (existingPlayer != null)
            {
                _logger.LogInformation("JoinRoom: Jogador '{PlayerName}' já está na sala '{RoomId}'. Reenviando estado...", playerName, normalizedRoomId);

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

                _logger.LogInformation("JoinRoom: Estado da sala '{RoomId}' reenviado para '{PlayerName}'", normalizedRoomId, playerName);
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
                totalPlayers = room.GameState.Players.Count,
                canStart = room.CanStart()  // Adiciona o canStart para atualizar o estado no frontend
            });

            // Envia o estado atual da sala para o novo jogador
            _logger.LogInformation("JoinRoom: Enviando estado da sala '{RoomId}' para novo jogador '{PlayerName}'", normalizedRoomId, playerName);

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

            _logger.LogInformation("JoinRoom: Jogador '{PlayerName}' entrou na sala '{RoomId}' com sucesso. Total de jogadores: {PlayerCount}", playerName, normalizedRoomId, room.GameState.Players.Count);
            return new { success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "JoinRoom: Erro ao adicionar jogador '{PlayerName}' na sala '{RoomId}'", playerName, roomId);
            return new { success = false, error = ex.Message };
        }
    }

    public async Task<object> StartGame()
    {
        try
        {
            _logger.LogInformation("StartGame: Tentando iniciar jogo (conexão: {ConnectionId})", Context.ConnectionId);

            var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
            if (room == null)
            {
                _logger.LogWarning("StartGame: Conexão {ConnectionId} não está em nenhuma sala", Context.ConnectionId);
                return new { success = false, error = "Você não está em uma sala." };
            }

            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player == null || !player.IsRoomCreator)
            {
                _logger.LogWarning("StartGame: Jogador não é o criador da sala '{RoomId}'", room.Id);
                return new { success = false, error = "Apenas o criador da sala pode iniciar o jogo." };
            }

            if (!room.CanStart())
            {
                _logger.LogWarning("StartGame: Sala '{RoomId}' não pode iniciar (Jogadores: {PlayerCount})", room.Id, room.GameState.Players.Count);
                return new { success = false, error = "Não é possível iniciar o jogo agora." };
            }

            _logger.LogInformation("StartGame: Iniciando jogo na sala '{RoomId}' com {PlayerCount} jogadores", room.Id, room.GameState.Players.Count);
            
            // Verifica se haverá troca de cartas (apenas se não é o primeiro jogo)
            var willExchangeCards = !room.GameState.IsFirstGame;
            
            _gameEngine.StartGame(room);

            // Se houver troca de cartas, notifica os jogadores
            if (willExchangeCards)
            {
                var presidente = room.GameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.Presidente);
                var vice = room.GameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.VicePresidente);
                var subCu = room.GameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.SubCu);
                var cu = room.GameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.Cu);

                var exchanges = new List<object>();
                
                if (cu != null && presidente != null)
                {
                    exchanges.Add(new
                    {
                        fromPlayer = new { id = cu.Id, name = cu.Name },
                        toPlayer = new { id = presidente.Id, name = presidente.Name },
                        cardCount = 2
                    });
                    exchanges.Add(new
                    {
                        fromPlayer = new { id = presidente.Id, name = presidente.Name },
                        toPlayer = new { id = cu.Id, name = cu.Name },
                        cardCount = 2
                    });
                }

                if (subCu != null && vice != null)
                {
                    exchanges.Add(new
                    {
                        fromPlayer = new { id = subCu.Id, name = subCu.Name },
                        toPlayer = new { id = vice.Id, name = vice.Name },
                        cardCount = 1
                    });
                    exchanges.Add(new
                    {
                        fromPlayer = new { id = vice.Id, name = vice.Name },
                        toPlayer = new { id = subCu.Id, name = subCu.Name },
                        cardCount = 1
                    });
                }

                await Clients.Group(room.Id).SendAsync("CardExchangeStarted", new
                {
                    exchanges = exchanges
                });

                _logger.LogInformation("StartGame: Troca de cartas iniciada na sala '{RoomId}'", room.Id);

                // Aguarda 3 segundos para a animação
                await Task.Delay(3000);

                await Clients.Group(room.Id).SendAsync("CardExchangeCompleted");
                _logger.LogInformation("StartGame: Troca de cartas completada na sala '{RoomId}'", room.Id);
            }

            // Notifica todos os jogadores que o jogo começou
            foreach (var p in room.GameState.Players)
            {
                await Clients.Client(p.ConnectionId).SendAsync("GameStarted", new
                {
                    gameNumber = room.GameState.GameNumber,
                    isFirstGame = room.GameState.IsFirstGame,
                    yourPlayerId = p.Id,  // Adiciona o ID do jogador para identificação
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
                        cardCount = pl.Hand.Count,
                        isRoomCreator = pl.IsRoomCreator  // Adiciona isRoomCreator
                    })
                });
            }

            _logger.LogInformation("StartGame: Jogo iniciado com sucesso na sala '{RoomId}'", room.Id);
            return new { success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "StartGame: Erro ao iniciar jogo (conexão: {ConnectionId})", Context.ConnectionId);
            return new { success = false, error = ex.Message };
        }
    }

    public async Task<object> PlayCards(List<string> cardIds)
    {
        try
        {
            _logger.LogInformation("PlayCards: Jogador tentando jogar {CardCount} carta(s) (conexão: {ConnectionId})", cardIds.Count, Context.ConnectionId);

            var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
            if (room == null)
            {
                _logger.LogWarning("PlayCards: Conexão {ConnectionId} não está em nenhuma sala", Context.ConnectionId);
                return new { success = false, error = "Você não está em uma sala." };
            }

            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player == null)
            {
                _logger.LogWarning("PlayCards: Jogador não encontrado na sala '{RoomId}' (conexão: {ConnectionId})", room.Id, Context.ConnectionId);
                return new { success = false, error = "Jogador não encontrado." };
            }

            // Valida a jogada
            _logger.LogInformation("PlayCards: Validando jogada do jogador '{PlayerName}' na sala '{RoomId}'", player.Name, room.Id);
            var (isValid, errorMessage) = _gameEngine.ValidatePlay(room.GameState, player, cardIds);
            if (!isValid)
            {
                _logger.LogWarning("PlayCards: Jogada inválida do jogador '{PlayerName}': {ErrorMessage}", player.Name, errorMessage);
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
            var playedCards = room.GameState.LastPlay?.Cards?.Select(c => new
            {
                id = c.Id,
                value = c.Value.ToString(),
                suit = c.Suit.ToString()
            }).ToList();

            await Clients.Group(room.Id).SendAsync("PlayerPlayed", new
            {
                playerId = player.Id,
                playerName = player.Name,
                cards = playedCards,
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
                _logger.LogInformation("PlayCards: Jogo terminou na sala '{RoomId}'", room.Id);
            }

            _logger.LogInformation("PlayCards: Jogada executada com sucesso pelo jogador '{PlayerName}' na sala '{RoomId}'", player.Name, room.Id);
            return new { success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PlayCards: Erro ao executar jogada (conexão: {ConnectionId})", Context.ConnectionId);
            return new { success = false, error = ex.Message };
        }
    }

    public async Task<object> Pass()
    {
        try
        {
            _logger.LogInformation("Pass: Jogador tentando passar (conexão: {ConnectionId})", Context.ConnectionId);

            var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
            if (room == null)
            {
                _logger.LogWarning("Pass: Conexão {ConnectionId} não está em nenhuma sala", Context.ConnectionId);
                return new { success = false, error = "Você não está em uma sala." };
            }

            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player == null)
            {
                _logger.LogWarning("Pass: Jogador não encontrado na sala '{RoomId}'", room.Id);
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
                _logger.LogInformation("Pass: Nova rodada iniciada na sala '{RoomId}'", room.Id);
            }

            _logger.LogInformation("Pass: Jogador '{PlayerName}' passou com sucesso na sala '{RoomId}'", player.Name, room.Id);
            return new { success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Pass: Erro ao passar (conexão: {ConnectionId})", Context.ConnectionId);
            return new { success = false, error = ex.Message };
        }
    }

    public async Task<object> StartNextGame()
    {
        try
        {
            _logger.LogInformation("StartNextGame: Tentando iniciar próxima partida (conexão: {ConnectionId})", Context.ConnectionId);

            var room = _roomManager.FindRoomByConnectionId(Context.ConnectionId);
            if (room == null)
            {
                _logger.LogWarning("StartNextGame: Conexão {ConnectionId} não está em nenhuma sala", Context.ConnectionId);
                return new { success = false, error = "Você não está em uma sala." };
            }

            var player = room.GetPlayerByConnectionId(Context.ConnectionId);
            if (player == null || !player.IsRoomCreator)
            {
                _logger.LogWarning("StartNextGame: Jogador não é o criador da sala '{RoomId}'", room.Id);
                return new { success = false, error = "Apenas o criador da sala pode iniciar a próxima partida." };
            }

            if (room.GameState.Phase != GamePhase.GameFinished)
            {
                _logger.LogWarning("StartNextGame: Partida atual na sala '{RoomId}' ainda não terminou (Fase: {Phase})", room.Id, room.GameState.Phase);
                return new { success = false, error = "A partida atual ainda não terminou." };
            }

            _logger.LogInformation("StartNextGame: Preparando próxima partida na sala '{RoomId}'", room.Id);
            _gameEngine.PrepareNextGame(room);
            
            // Verifica se haverá troca de cartas (sempre haverá após o primeiro jogo)
            var willExchangeCards = !room.GameState.IsFirstGame;
            
            _gameEngine.StartGame(room);

            // Se houver troca de cartas, notifica os jogadores
            if (willExchangeCards)
            {
                var presidente = room.GameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.Presidente);
                var vice = room.GameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.VicePresidente);
                var subCu = room.GameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.SubCu);
                var cu = room.GameState.Players.FirstOrDefault(p => p.Rank == PlayerRank.Cu);

                var exchanges = new List<object>();
                
                if (cu != null && presidente != null)
                {
                    exchanges.Add(new
                    {
                        fromPlayer = new { id = cu.Id, name = cu.Name },
                        toPlayer = new { id = presidente.Id, name = presidente.Name },
                        cardCount = 2
                    });
                    exchanges.Add(new
                    {
                        fromPlayer = new { id = presidente.Id, name = presidente.Name },
                        toPlayer = new { id = cu.Id, name = cu.Name },
                        cardCount = 2
                    });
                }

                if (subCu != null && vice != null)
                {
                    exchanges.Add(new
                    {
                        fromPlayer = new { id = subCu.Id, name = subCu.Name },
                        toPlayer = new { id = vice.Id, name = vice.Name },
                        cardCount = 1
                    });
                    exchanges.Add(new
                    {
                        fromPlayer = new { id = vice.Id, name = vice.Name },
                        toPlayer = new { id = subCu.Id, name = subCu.Name },
                        cardCount = 1
                    });
                }

                await Clients.Group(room.Id).SendAsync("CardExchangeStarted", new
                {
                    exchanges = exchanges
                });

                _logger.LogInformation("StartNextGame: Troca de cartas iniciada na sala '{RoomId}'", room.Id);

                // Aguarda 3 segundos para a animação
                await Task.Delay(3000);

                await Clients.Group(room.Id).SendAsync("CardExchangeCompleted");
                _logger.LogInformation("StartNextGame: Troca de cartas completada na sala '{RoomId}'", room.Id);
            }

            // Notifica todos os jogadores
            foreach (var p in room.GameState.Players)
            {
                await Clients.Client(p.ConnectionId).SendAsync("GameStarted", new
                {
                    gameNumber = room.GameState.GameNumber,
                    isFirstGame = room.GameState.IsFirstGame,
                    yourPlayerId = p.Id,  // Adiciona o ID do jogador para identificação
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
                        cardCount = pl.Hand.Count,
                        isRoomCreator = pl.IsRoomCreator  // Adiciona isRoomCreator
                    })
                });
            }

            _logger.LogInformation("StartNextGame: Próxima partida iniciada com sucesso na sala '{RoomId}'", room.Id);
            return new { success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "StartNextGame: Erro ao iniciar próxima partida (conexão: {ConnectionId})", Context.ConnectionId);
            return new { success = false, error = ex.Message };
        }
    }
}

