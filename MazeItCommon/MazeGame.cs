using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using CommonLibraries;
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

        public MazeGame(List<MazeGameClientPlayer> playerList, MazeData loadedData)
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
                MazeBuilders[mazeGameClientPlayer.ID] = new Builder(Data.Walls,RandomColor());
            }
        }

        private string RandomColor()
        {
            return "#" + ((int)(Math.Floor(Math.Random() * 16777215))).ToString(16);
        }
    }
}