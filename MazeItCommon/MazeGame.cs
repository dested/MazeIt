using System.Runtime.CompilerServices;
using CommonLibraries;
namespace MazeItCommon
{
    public class MazeGame
    {
        protected IntPoint CurrentMazePoint;
        [IntrinsicProperty]
        protected MazeData data { get; set; }

        public MazeGame()
        {
            CurrentMazePoint = new IntPoint(0, 0);
            data = new MazeData(50);
            Carver carver = new Carver(data);
            carver.Walk();
        }


        protected bool AddMazePoint(IntPoint p0)
        {
            bool d;
            if (d = ( data.MazeBuilder.AddIntPoint(p0, false) == Status.Good )) {
                CurrentMazePoint = p0;
            }
            return d;
        }
    }
}