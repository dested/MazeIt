using System.Runtime.CompilerServices;
using CommonLibraries;
namespace MazeItClient
{
    public class Pointer : Point
    {
        [IntrinsicProperty]
        public int Delta { get; set; }
        [IntrinsicProperty]
        public bool Right { get; set; }

        public Pointer(int x, int y, int delta = 0, bool right = false)
                : base(x, y)
        {
            Delta = delta;
            Right = right;
        }
    }
}