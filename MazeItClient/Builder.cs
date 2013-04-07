using System.Collections.Generic;
using CommonLibraries;
namespace Blockade
{
    public class Builder
    {
        public List<IntPoint> Points;
        public bool[,] NumHits;
        private WallInfo[,] theWalls;

        public Builder(WallInfo[,] wallInfo)
        {
            theWalls = wallInfo;
            NumHits = new bool[wallInfo.Length,wallInfo.Length];

            NumHits[0, 0] = true;
            Points = new List<IntPoint>();

            AddIntPoint(new IntPoint(0, 0), true);
        }

        public Status AddIntPoint(IntPoint p, bool wasBad)
        {
            if (p.X < 0 || p.X >= theWalls.Length || p.Y < 0 || p.Y >= theWalls.Length)
                return Status.Bad;

            IntPoint pr;
            if (Points.Count > 0) {
                pr = Points[Points.Count - 1];
                if (pr.X == p.X && pr.Y == p.Y) return Status.Same;
            } else {
                Points.Add(p);
                return Status.Good;
            }

            if (pr.X + 1 == p.X) {
                if (theWalls[p.X, p.Y].Contains(WallPiece.East))
                    return Status.Bad;
            } else if (pr.X - 1 == p.X) {
                if (theWalls[p.X, p.Y].Contains(WallPiece.West))
                    return Status.Bad;
            } else if (pr.Y + 1 == p.Y) {
                if (theWalls[p.X, p.Y].Contains(WallPiece.North))
                    return Status.Bad;
            } else if (pr.Y - 1 == p.Y) {
                if (theWalls[p.X, p.Y].Contains(WallPiece.South))
                    return Status.Bad;
            }

            if (Points.Count > 0 && wasBad) return Points.Contains(p) ? Status.Good : Status.Bad;

         /*   int inj = Points.Count;
            if (inj > 2) {
                if (Points[inj - 1].X == p.X && Points[inj - 1].Y == p.Y)

                    NumHits[Points[inj - 2].X, Points[inj - 2].Y] = !NumHits[Points[inj - 2].X, Points[inj - 2].Y];
                else NumHits[p.X, p.Y] = !NumHits[p.X, p.Y];
            }
                else
                NumHits[p.X, p.Y] = !NumHits[p.X, p.Y];*/
            NumHits[p.X, p.Y] = !NumHits[p.X, p.Y];
/*
            var pm = Points[Points.Count - 1];
            NumHits[pm.X, pm.Y] = !NumHits[pm.X, pm.Y];*/
            Points.Add(p);

            return Status.Good;
        }

        public List<IntPoint> Magnify(int blockSize)
        {
            List<IntPoint> ps = new List<IntPoint>();
            foreach (IntPoint IntPoint in Points) {
                ps.Add(new IntPoint(( IntPoint.X * blockSize ) + ( blockSize / 2 ), ( IntPoint.Y * blockSize ) + ( blockSize / 2 )));
            }

            return ps;
        }

        public static List<IntPoint> Magnify(List<IntPoint> IntPoints, float blockSize, IntPoint offset)
        {
            List<IntPoint> ps = new List<IntPoint>();
            foreach (IntPoint IntPoint in IntPoints) {
                ps.Add(new IntPoint((int) ( IntPoint.X * blockSize ) + (int) ( blockSize / 2 ) + offset.X, (int) ( IntPoint.Y * blockSize ) + (int) ( blockSize / 2 ) + offset.Y));
            }

            return ps;
        }
    }
}