using System;
namespace MazeItCommon
{
    [Serializable]
    public class MoveDirection
    {
        public MoveDirection(WallPiece direction, int count)
        {
            Direction = direction;
            Index = count;
        }

        public WallPiece Direction { get; set; }
        public int Index { get; set; }
    }
}