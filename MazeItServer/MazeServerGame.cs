using System.Collections.Generic;
using System.Runtime.CompilerServices;
using MazeItCommon;
namespace MazeItServer
{
    public class MazeServerGame
    {
        private readonly MazeServer myServer;
        [IntrinsicProperty]
        private MazeGame Game { get; set; }
        [IntrinsicProperty]
        public List<MazeGamePlayer> Players { get; set; }

        public MazeServerGame(MazeServer server, WaitingRoom waitingRoom)
        {
            myServer = server;
            Players = new List<MazeGamePlayer>();

            Players.AddRange(waitingRoom.Players);

            foreach (var mazeGamePlayer in Players) {
                mazeGamePlayer.SendMessage("WaitingRoom.GameBeginning", null);
            }

            var playerList = Players.Map(a => new MazeGameClientPlayer(a.ID, a.Color));

            foreach (var mazeGamePlayer in Players) {
                mazeGamePlayer.SendMessage("MazeGame.PlayerReflect", mazeGamePlayer.ID);
                mazeGamePlayer.SendMessage("MazeGame.PlayerInfo", playerList);
            }

            Game = new MazeGame(playerList, null, null);

            foreach (var mazeGamePlayer in Players) {
                mazeGamePlayer.SendMessage("MazeGame.MazeData", Game.Data);
            }
        }

        public PlayerPositionUpdate MovePlayer(MazeGamePlayer player, MoveDirection piece)
        {
            PlayerPositionUpdate playerPositionUpdate = null;

            var mazeBuilder = Game.MazeBuilders[player.ID];

            if (mazeBuilder.Navigate(piece.Direction)) {
                playerPositionUpdate = new PlayerPositionUpdate(player.ID, piece.Direction);

                if (mazeBuilder.CurrentMazePoint.X == Game.Data.MazeSize - 1 && mazeBuilder.CurrentMazePoint.Y == Game.Data.MazeSize - 1) {
                    foreach (var mazeGamePlayer in Players) {
                        mazeGamePlayer.SendMessage("MazeGame.PlayerWon", player.ID);
                    }
                }
            }
            return playerPositionUpdate;
        }

        public void RemovePlayer(MazeGamePlayer player)
        {
            Players.Remove(player);
            foreach (var mazeGamePlayer in Players) {
                mazeGamePlayer.SendMessage("MazeGame.PlayerLeft", new MazeGameClientPlayer(player.ID, player.Color));
            }

            if (Players.Count == 0) myServer.Games.Remove(this);
        }

        public bool ContainsPlayer(MazeGamePlayer player)
        {
            foreach (var mazeGamePlayer in Players) {
                if (mazeGamePlayer.ID == player.ID) return true;
            }
            return false;
        }
    }
}