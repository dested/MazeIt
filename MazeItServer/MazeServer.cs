using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using MazeItCommon;
namespace MazeItServer
{
    public class MazeServer
    {
        public const int MaxPlayers = 5;
        [IntrinsicProperty]
        public List<MazeServerGame> Games { get; set; }
        [IntrinsicProperty]
        private List<WaitingRoom> WaitingRooms { get; set; }
        [IntrinsicProperty]
        private JsDictionary<int, MazeGamePlayer> Players { get; set; }

        public MazeServer()
        {
            WaitingRooms = new List<WaitingRoom>();
            Games = new List<MazeServerGame>();
            Players = new JsDictionary<int, MazeGamePlayer>();
        }

        public void AddPlayer(int userID, Action<string, object> sendMessage)
        {
            var mazeGamePlayer = new MazeGamePlayer(userID, Extensions.RandomColor(), sendMessage);
            Players[userID] = mazeGamePlayer;

            foreach (var waitingRoom in WaitingRooms) {
                if (waitingRoom.Players.Count < MaxPlayers) {
                    waitingRoom.AddPlayer(mazeGamePlayer);
                    return;
                }
            }
            WaitingRoom room = new WaitingRoom(this);
            room.AddPlayer(mazeGamePlayer);
            WaitingRooms.Add(room);
        }

        public void ChangeVoteStart(int userID, bool vote)
        {
            var player = Players[userID];

            foreach (var waitingRoom in WaitingRooms) {
                if (waitingRoom.ContainsPlayer(player)) {
                    waitingRoom.ChangeVoteStart(player, vote);
                    return;
                }
            }
        }

        public void MovePlayer(int userID, List<MoveDirection> directions)
        {
            var player = Players[userID];

            foreach (var gameRoom in Games) {
                if (gameRoom.ContainsPlayer(player)) {
                    List<PlayerPositionUpdate> updates = new List<PlayerPositionUpdate>();

                    foreach (var wallPiece in directions) {
                        var update = gameRoom.MovePlayer(player, wallPiece);
                        if (update != null) updates.Add(update);
                    }

                    foreach (var mazeGamePlayer in gameRoom.Players) {
                        if (mazeGamePlayer != player)
                            mazeGamePlayer.SendMessage("MazeGame.PlayerPositionUpdates", updates);
                    }
                    return;
                }
            }
        }

        public void RemovePlayer(int userID)
        {
            var player = Players[userID];

            foreach (var waitingRoom in WaitingRooms) {
                if (waitingRoom.ContainsPlayer(player)) {
                    waitingRoom.RemovePlayer(player);
                    if (waitingRoom.Players.Count == 0) WaitingRooms.Remove(waitingRoom);
                    return;
                }
            }
            foreach (var game in Games) {
                if (game.ContainsPlayer(player)) {
                    game.RemovePlayer(player);

                    if (game.Players.Count == 0)
                        Games.Remove(game);

                    return;
                }
            }
        }

        public void MigrateFromWaitingRoom(WaitingRoom waitingRoom)
        {
            WaitingRooms.Remove(waitingRoom);

            MazeServerGame mazeServerGame = new MazeServerGame(this, waitingRoom);
            Games.Add(mazeServerGame);
        }
    }
}