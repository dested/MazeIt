using System.Runtime.CompilerServices;
namespace Blockade
{
    public class MazeData
    {
        [IntrinsicProperty]
        public int MazeSize { get; set; }
        [IntrinsicProperty]
        public WallInfo[,] Walls { get; set; }
        [IntrinsicProperty]
        public Builder MazeBuilder { get; set; }

        public MazeData(int mazeSize)
        {
            MazeSize = mazeSize;
            Walls = new WallInfo[mazeSize,mazeSize];
            for (int i = 0; i < MazeSize; i++) {
                for (int a = 0; a < MazeSize; a++) {
                    Walls[i, a] = WallInfo.All();
                }
            }
            MazeBuilder = new Builder(Walls);
        }
    }
}