using PresidenteGame.Models;
using System.Collections.Concurrent;

namespace PresidenteGame.Core;

public class RoomManager
{
    private readonly ConcurrentDictionary<string, Room> _rooms = new();

    public Room CreateRoom(string roomName, string creatorConnectionId)
    {
        var room = new Room(roomName, creatorConnectionId);
        _rooms.TryAdd(room.Id, room);
        return room;
    }

    public Room? GetRoom(string roomId)
    {
        // Garante que a busca seja case-insensitive convertendo para maiúsculas
        var normalizedRoomId = roomId?.ToUpperInvariant() ?? "";
        _rooms.TryGetValue(normalizedRoomId, out var room);
        return room;
    }

    public bool RoomExists(string roomId)
    {
        // Garante que a busca seja case-insensitive convertendo para maiúsculas
        var normalizedRoomId = roomId?.ToUpperInvariant() ?? "";
        return _rooms.ContainsKey(normalizedRoomId);
    }

    public void RemoveRoom(string roomId)
    {
        _rooms.TryRemove(roomId, out _);
    }

    public List<Room> GetAllRooms()
    {
        return _rooms.Values.ToList();
    }

    public void CleanupInactiveRooms(TimeSpan inactivityThreshold)
    {
        var now = DateTime.UtcNow;
        var inactiveRooms = _rooms.Values
            .Where(r => now - r.LastActivityAt > inactivityThreshold)
            .ToList();

        foreach (var room in inactiveRooms)
        {
            _rooms.TryRemove(room.Id, out _);
        }
    }

    public Room? FindRoomByConnectionId(string connectionId)
    {
        return _rooms.Values
            .FirstOrDefault(r => r.GameState.Players.Any(p => p.ConnectionId == connectionId));
    }
}

