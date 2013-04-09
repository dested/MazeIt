using System.Collections.Generic;
using System.Runtime.CompilerServices;
namespace MazeItCommon
{
    public class MazeGame
    {
        [IntrinsicProperty]
        public List<MazeGameClientPlayer> PlayerList { get; set; }
        [IntrinsicProperty]
        public MazeData Data { get; set; }
        [IntrinsicProperty]
        public JsDictionary<int, Builder> MazeBuilders { get; set; }

        public MazeGame(List<MazeGameClientPlayer> playerList, MazeGameClientPlayer currentPlayer, MazeData loadedData)
        {
            PlayerList = playerList;
            if (loadedData == null) {
                Data = new MazeData(50);

                Carver carver = new Carver(Data);
                carver.Walk();
            } else
                Data = loadedData;

            MazeBuilders = new JsDictionary<int, Builder>();

            foreach (var mazeGameClientPlayer in PlayerList) {
                if (currentPlayer != null) {
                    if (currentPlayer.ID != mazeGameClientPlayer.ID) MazeBuilders[mazeGameClientPlayer.ID] = new Builder(Data.Walls, mazeGameClientPlayer.Color);
                } else MazeBuilders[mazeGameClientPlayer.ID] = new Builder(Data.Walls, mazeGameClientPlayer.Color);
            }

            if (currentPlayer != null)
                MazeBuilders[currentPlayer.ID] = new Builder(Data.Walls, currentPlayer.Color);
        }
    }
}