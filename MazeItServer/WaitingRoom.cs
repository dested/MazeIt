using System.Collections.Generic;
using System.Runtime.CompilerServices;
using CommonLibraries;
namespace MazeItServer
{
    public class WaitingRoom
    {
        private readonly MazeServer myServer;
        [IntrinsicProperty]
        public List<MazeGamePlayer> Players { get; set; }
        [IntrinsicProperty]
        public JsDictionary<int, bool> VoteStart { get; set; }

        public WaitingRoom(MazeServer server)
        {
            myServer = server;
            Players = new List<MazeGamePlayer>();
            VoteStart = new JsDictionary<int, bool>();
        }

        public void AddPlayer(MazeGamePlayer player)
        {
            Players.Add(player);
            VoteStart[player.ID] = false;
            Console.Log("Number of players: " + Players.Count);

            int count = 0;
            foreach (var vs in VoteStart) {
                if (vs.Value) count++;
            }

            foreach (var mazeGamePlayer in Players) {
                mazeGamePlayer.SendMessage("WaitingRoom.PlayerCountChanged", Players.Count);
                voteStartUpdated(count, mazeGamePlayer);
            }
        }

        public void ChangeVoteStart(MazeGamePlayer player, bool start)
        {
            VoteStart[player.ID] = start;

            int count = 0;
            foreach (var vs in VoteStart) {
                if (vs.Value) count++;
            }

            foreach (var mazeGamePlayer in Players) {
                voteStartUpdated(count, mazeGamePlayer);
            }
            if (count == Players.Count)
                myServer.MigrateFromWaitingRoom(this);
        }

        private void voteStartUpdated(int voteStartCount, MazeGamePlayer player)
        {
            player.SendMessage("WaitingRoom.VoteStartChanged", voteStartCount);
        }

        public void RemovePlayer(MazeGamePlayer player)
        {
            Players.Remove(player);
            VoteStart.Remove(player.ID);

            int count = 0;
            foreach (var vs in VoteStart) {
                if (vs.Value) count++;
            }
            foreach (var mazeGamePlayer in Players) {
                mazeGamePlayer.SendMessage("WaitingRoom.PlayerCountChanged", Players.Count);
                voteStartUpdated(count, mazeGamePlayer);
            }
            if (count == Players.Count)
                myServer.MigrateFromWaitingRoom(this);
        }

        public bool ContainsPlayer(MazeGamePlayer player)
        {
            return Players.Contains(player);
        }
    }
}