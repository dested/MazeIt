using System;
using System.Collections.Generic;
using CommonLibraries;
namespace MazeItCommon
{
    public class Builder
    {
        public string Color { get; set; }
        public IntPoint CurrentMazePoint;
        public bool[][] NumHits;
        public List<IntPoint> Points;
        private WallInfo[][] theWalls;

        public Builder(WallInfo[][] wallInfo,string color)
        {
            Color = color;
            theWalls = wallInfo;
            NumHits = new bool[wallInfo.Length][];
            for (int i = 0; i < wallInfo.Length; i++) {
                NumHits[i] = new bool[wallInfo.Length];
            }

            NumHits[0][0] = true;
            CurrentMazePoint = new IntPoint(0, 0);

            Points = new List<IntPoint>();

            AddPoint(new IntPoint(0, 0), true);
        }

        public bool AddMazePoint(IntPoint p0)
        {
            bool d = ( AddPoint(p0, false) == Status.Good );
            if (d)
                CurrentMazePoint = p0;
            return d;
        }

        public Status AddPoint(IntPoint p, bool wasBad)
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
                if (theWalls[p.X][p.Y].Contains(WallPiece.East))
                    return Status.Bad;
            } else if (pr.X - 1 == p.X) {
                if (theWalls[p.X][p.Y].Contains(WallPiece.West))
                    return Status.Bad;
            } else if (pr.Y + 1 == p.Y) {
                if (theWalls[p.X][p.Y].Contains(WallPiece.North))
                    return Status.Bad;
            } else if (pr.Y - 1 == p.Y) {
                if (theWalls[p.X][p.Y].Contains(WallPiece.South))
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
            NumHits[p.X][p.Y] = !NumHits[p.X][p.Y];
/*
            var pm = Points[Points.Count - 1];
            NumHits[pm.X, pm.Y] = !NumHits[pm.X, pm.Y];*/
            Points.Add(p);
            Console.Log("Adding Point: "+Points.Count);
            return Status.Good;
        }

        public List<Tuple<IntPoint, IntPoint, Rect>> Blockify(int blockSize)
        {
            List<IntPoint> ps = new List<IntPoint>();
            foreach (IntPoint point in Points) {
                IntPoint pt = new IntPoint(( point.X * blockSize ) + ( blockSize / 2 ), ( point.Y * blockSize ) + ( blockSize / 2 ));
                ps.Add(pt);
            }
            List<Tuple<IntPoint, IntPoint, Rect>> pts = new List<Tuple<IntPoint, IntPoint, Rect>>();
            if (ps.Count == 1)
                pts.Add(new Tuple<IntPoint, IntPoint, Rect>(Points[0], ps[0], null));

            for (int index = 0; index < ps.Count - 1; index++) {
                var intPoint = ps[index];
                pts.Add(Tuple.Create(Points[index], intPoint, toRect(ps, index)));
            }

            return pts;
        }

        public static Rect toRect(List<IntPoint> vf, int index)
        {
            IntPoint point = vf[index];
            IntPoint point2 = vf[index + 1];

            int left, right, top, bottom;

            Rect cur;
            if (point2.X > point.X) {
                left = point.X - 1;
                right = point2.X + 1;
            } else {
                left = point2.X - 1;
                right = point.X + 1;
            }
            if (point2.Y > point.Y) {
                top = point.Y - 1;
                bottom = point2.Y + 1;
            } else {
                top = point2.Y - 1;
                bottom = point.Y + 1;
            }

            cur = new Rect(left, top, right, bottom);

            return cur;
        }

        public bool Navigate(WallPiece piece)
        {
            var point = new IntPoint(CurrentMazePoint.X, CurrentMazePoint.Y);
            switch (piece) {
                case WallPiece.South:
                    point.Y++;
                    break;
                case WallPiece.North:
                    point.Y--;
                    break;
                case WallPiece.East:
                    point.X++;
                    break;
                case WallPiece.West:
                    point.X--;
                    break;
            }


            return AddMazePoint(point);
        }
    }
}