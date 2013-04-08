namespace MazeItCommon
{
    public class WallInfo
    {
        public bool East;
        public bool North;
        public bool South;
        public bool West;

        public static WallInfo All()
        {
            WallInfo b = new WallInfo();
            b.South = true;
            b.North = true;
            b.East = true;
            b.West = true;
            return b;
        }

        public bool StartingPosition()
        {
            return South && North && East && West;
        }

        public void Remove(WallPiece direction)
        {
            switch (direction) {
                case WallPiece.North:
                    North = false;
                    break;
                case WallPiece.South:
                    South = false;
                    break;
                case WallPiece.East:
                    East = false;
                    break;
                case WallPiece.West:
                    West = false;
                    break;
            }
        }

        public bool Contains(WallPiece direction)
        {
            switch (direction) {
                case WallPiece.North:
                    return North;
                case WallPiece.South:
                    return South;
                case WallPiece.East:
                    return East;
                case WallPiece.West:
                    return West;
            }
            return false;
        }
    }
}