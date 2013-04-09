using System.Runtime.CompilerServices;
namespace MazeItCommon
{
    public class MazeGameClientPlayer
    {
        [IntrinsicProperty]
        public int ID { get; set; }
        [IntrinsicProperty]
        public string Color { get; set; }

        public MazeGameClientPlayer(int id, string color)
        {
            ID = id;
            Color = color;
        }
    }
}