using System;
namespace MazeItCommon
{
    [Serializable]
    public class PlayerPositionUpdate
    {
        public int ID { get; set; }
        public WallPiece Navigate { get; set; }

        public PlayerPositionUpdate(int id, WallPiece navigate)
        {
            ID = id;
            Navigate = navigate;
        }
    }
}