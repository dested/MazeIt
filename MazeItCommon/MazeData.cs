using System.Runtime.CompilerServices;
namespace MazeItCommon
{
    public class MazeData
    {
        [IntrinsicProperty]
        public int MazeSize { get; set; }
        [IntrinsicProperty]
        public WallInfo[][] Walls { get; set; }

        public MazeData(int mazeSize)
        {
            MazeSize = mazeSize;
            Walls = new WallInfo[mazeSize][];
            for (int i = 0; i < MazeSize; i++)
            {
                Walls[i] = new WallInfo[MazeSize];
                for (int a = 0; a < MazeSize; a++)
                {
                    Walls[i][a] = WallInfo.All();
                }
            }
        }
        public MazeData(int mazeSize,WallInfo[][] walls)
        {
            MazeSize = mazeSize;
            Walls = new WallInfo[mazeSize][];
            for (int i = 0; i < MazeSize; i++)
            {
                Walls[i] = new WallInfo[MazeSize];
                for (int a = 0; a < MazeSize; a++)
                {
                    Walls[i][a] = new WallInfo(walls[i][a]);
                }
            }
        }
    }
}