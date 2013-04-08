using System.Runtime.CompilerServices;
namespace MazeItCommon
{
    public class Rect
    {
        [IntrinsicProperty]
        public int Left { get; set; }
        [IntrinsicProperty]
        public int Right { get; set; }
        [IntrinsicProperty]
        public int Top { get; set; }
        [IntrinsicProperty]
        public int Bottom { get; set; }
        public int Width
        {
            get { return Right - Left; }
        }
        public int Height
        {
            get { return Bottom - Top; }
        }

        public Rect(int left, int top, int right, int bottom)
        {
            Left = left;
            Right = right;
            Top = top;
            Bottom = bottom;
        }
    }
}