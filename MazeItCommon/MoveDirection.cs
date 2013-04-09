using System;
namespace MazeItCommon
{
    [Serializable]
    public class MoveDirection
    {
        public WallPiece Direction { get; set; }
        public int Index { get; set; }

        public MoveDirection(WallPiece direction, int count)
        {
            Direction = direction;
            Index = count;
        }
    }
}