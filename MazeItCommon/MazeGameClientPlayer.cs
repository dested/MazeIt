using System.Runtime.CompilerServices;
namespace MazeItCommon
{
    public class MazeGameClientPlayer
    {
        [IntrinsicProperty]
        public int ID { get; set; }

        public MazeGameClientPlayer(int id)
        {
            ID = id;
        }
    }
}