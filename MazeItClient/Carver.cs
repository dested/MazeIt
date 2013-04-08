using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
namespace Blockade
{
    public class Carver
    {
        private List<WallPiece> gms = new List<WallPiece>() {WallPiece.East, WallPiece.North, WallPiece.South, WallPiece.West};
        [IntrinsicProperty]
        public MazeData Data { get; set; }
        [IntrinsicProperty]
        public bool[][] bw { get; set; }

        public Carver(MazeData data)
        {
            Data = data;
        }

        public void Walk()
        {
            bw = new bool[Data.MazeSize][];
            for (int i = 0; i < Data.MazeSize; i++)
            {
                bw[i] = new bool[Data.MazeSize];
            }
            walker(0, 0); 
        }

        public void walker(int cx, int cy)
        {
            foreach (WallPiece direction in RandomizeEach()) {
                int nx = cx + getDX(direction);
                int ny = cy + getDY(direction);
                if (ny >= 0 && ny <= Data.MazeSize - 1 && nx >= 0 && nx <= Data.MazeSize - 1 && !bw[nx][ ny]) {
                    //if (!bw[nx][ny]) 
                    {
                        bw[nx][ ny] = true;
                        Data.Walls[cx][ cy].Remove(direction);
                        Data.Walls[nx][ny].Remove(getOpposite(direction));
                        walker(nx, ny);
                    }
                }
            }
        }

        private List<WallPiece> MixList(List<WallPiece> ipl)
        {
            List<WallPiece> inputList = new List<WallPiece>(ipl);
            List<WallPiece> randomList = new List<WallPiece>();

            int randomIndex = 0;
            while (inputList.Count > 0) {
                randomIndex = (int) ( Math.Random() * inputList.Count ); // Choose a random, obj in the list
                randomList.Add(inputList[randomIndex]); // add it to the new, random list
                inputList.RemoveAt(randomIndex); // remove to avoid duplicates
            }

            return randomList; // return the new random list
        }

        private List<WallPiece> RandomizeEach()
        {
            return MixList(gms);
        }

        private WallPiece getOpposite(WallPiece wallse)
        {
            switch (wallse) {
                case WallPiece.North:
                    return WallPiece.South;
                case WallPiece.South:
                    return WallPiece.North;
                case WallPiece.East:
                    return WallPiece.West;
                case WallPiece.West:
                    return WallPiece.East;
            }
            return WallPiece.East; // never hit
        }

        private int getDX(WallPiece wallse)
        {
            switch (wallse) {
                case WallPiece.North:
                case WallPiece.South:
                    return 0;
                case WallPiece.East:
                    return -1;
                case WallPiece.West:
                    return 1;
            }
            return 0;
        }

        private int getDY(WallPiece wallse)
        {
            switch (wallse) {
                case WallPiece.North:
                    return -1;
                case WallPiece.South:
                    return 1;
                case WallPiece.East:
                case WallPiece.West:
                    return 0;
            }
            return 0;
        }
    }
}