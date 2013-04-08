using System;
using System.Collections.Generic;
using System.Html.Media.Graphics;
using Blockade;
using CommonLibraries;
using MazeItCommon;
namespace MazeItClient
{
    class MazeGameClient : MazeGame
    {
        private readonly CanvasInformation myMainCanvasInfo;
        private readonly CanvasInformation myPlaceCanvasInfo;
        private int myHeight;
        private IntPoint startMouse;
        private int myWidth;
        private int BlockSize = 20;
        public bool dragging = false;
        private int lineSize = 2;
        private IntPoint positionOffset = new IntPoint(0, 0);
        private float scaleOffset = 1;
        public bool scaling = false;
        
        public MazeGameClient(int width, int height, CanvasInformation mainCanvasInfo, CanvasInformation placeCanvasInfo) : base()
        {
            myWidth = width;
            myHeight = height;
            myMainCanvasInfo = mainCanvasInfo;
            myPlaceCanvasInfo = placeCanvasInfo;

            positionOffset.X += (int)(myWidth / 8);
            positionOffset.Y += (int)(myHeight / 8);

            draw();
        }

        public void TouchDown(int x, int y)
        {
            startMouse = new IntPoint(x, y);
        }

        public void TouchDrag(int x, int y)
        {
            if (startMouse == null) return;

            IntPoint lastMous = new IntPoint(x, y);

            IntPoint pd = PointDifference(lastMous, startMouse);

            /*        if (Math.Abs(pd.X) < 5 || Math.Abs(pd.Y) < 5)
            {
                return;
            }*/

            if (dragging)
            {
                positionOffset.X += pd.X;
                positionOffset.Y += pd.Y;
                draw();
                return;
            }
            if (scaling)
            {
                scaleOffset = (float)Math.Max(scaleOffset + pd.Y / 100f, 0.35);
                draw();
                return;
            }
            bool b = false;
            switch (getDirection(pd))
            {
                case WallPiece.North:
                    b = AddMazePoint(new IntPoint(CurrentMazePoint.X, CurrentMazePoint.Y - 1));
                    break;
                case WallPiece.South:
                    b = AddMazePoint(new IntPoint(CurrentMazePoint.X, CurrentMazePoint.Y + 1));
                    break;
                case WallPiece.West:
                    b = AddMazePoint(new IntPoint(CurrentMazePoint.X - 1, CurrentMazePoint.Y));
                    break;
                case WallPiece.East:
                    b = AddMazePoint(new IntPoint(CurrentMazePoint.X + 1, CurrentMazePoint.Y));
                    break;
            }
            if (b) {
                draw();
            }
            startMouse = lastMous;
        }
        private WallPiece getDirection(IntPoint pd)
        {
            if (pd.X < 0)
            {
                if (Math.Abs(pd.X) > Math.Abs(pd.Y))
                    return WallPiece.East;
            }
            if (pd.X >= 0)
            {
                if (Math.Abs(pd.X) > Math.Abs(pd.Y))
                    return WallPiece.West;
            }
            if (pd.Y > 0)
                return WallPiece.North;
            if (pd.Y <= 0)
                return WallPiece.South;
            return WallPiece.East;
        }

        public void TouchEnd()
        {
            startMouse = null;
        }
        private IntPoint PointDifference(IntPoint startMouse, IntPoint lastMous)
        {
            return new IntPoint((lastMous.X - startMouse.X), (lastMous.Y - startMouse.Y));
        }

        public void draw()
        {
            var canvas = myMainCanvasInfo.Context;
            canvas.Save();
            canvas.ClearRect(0, 0, myWidth, myHeight);

            canvas.FillStyle = "white";

            canvas.Translate(positionOffset.X - CurrentMazePoint.X * BlockSize,
                             positionOffset.Y - CurrentMazePoint.Y * BlockSize);
            canvas.Scale(scaleOffset, scaleOffset);

            canvas.LineCap = LineCap.Round;
            canvas.LineJoin = LineJoin.Round;

            for (int i = 0; i < data.MazeSize; i++)
            {
                for (int a = 0; a < data.MazeSize; a++)
                {
                    int i1 = (i) * BlockSize - CurrentMazePoint.X * BlockSize + positionOffset.X;
                    int a1 = (a) * BlockSize - CurrentMazePoint.Y * BlockSize + positionOffset.Y;
                    if (i1 > -BlockSize && i1 < myWidth / scaleOffset && a1 > -BlockSize && a1 < myHeight / scaleOffset)
                    {
                        if (data.Walls[i][a].Contains(WallPiece.West))
                            canvas.FillRect((i + 1) * BlockSize, (a) * BlockSize - lineSize * 2, lineSize, BlockSize + lineSize * 2);
                        if (data.Walls[i][a].Contains(WallPiece.East))
                            canvas.FillRect((i) * BlockSize - lineSize, (a) * BlockSize - lineSize * 2, lineSize, BlockSize + lineSize * 2);
                        if (data.Walls[i][a].Contains(WallPiece.North))
                            canvas.FillRect((i) * BlockSize - lineSize * 2, (a) * BlockSize, BlockSize + lineSize * 2, lineSize);
                        if (data.Walls[i][a].Contains(WallPiece.South))
                            canvas.FillRect((i) * BlockSize - lineSize * 2, (a + 1) * BlockSize - lineSize, BlockSize + lineSize * 2, lineSize);
                    }
                }
            }
            drawPlace();
            canvas.Restore();
        }

        private void drawPlace()
        {
            var canvas = myPlaceCanvasInfo.Context;
            canvas.Save();

            canvas.ClearRect(0, 0, myWidth, myHeight);
            canvas.Translate(positionOffset.X - CurrentMazePoint.X * BlockSize,
                             positionOffset.Y - CurrentMazePoint.Y * BlockSize);
            canvas.Scale(scaleOffset, scaleOffset);

            canvas.LineCap = LineCap.Round;
            canvas.LineJoin = LineJoin.Round;
            List<Tuple<IntPoint, IntPoint, Rect>> vf = data.MazeBuilder.Blockify(BlockSize);

            int inj = vf.Count;
            if (inj > 1)
            {
                foreach (Tuple<IntPoint, IntPoint, Rect> m in vf)
                {
                    int i1 = (m.Item1.X) * BlockSize - CurrentMazePoint.X * BlockSize + positionOffset.X;
                    int a1 = (m.Item1.Y) * BlockSize - CurrentMazePoint.Y * BlockSize + positionOffset.Y;
                    if (i1 > -BlockSize && i1 < myWidth / scaleOffset && a1 > -BlockSize && a1 < myHeight / scaleOffset)
                    {
                        if (data.MazeBuilder.NumHits[m.Item1.X][m.Item1.Y])
                        {
                            canvas.Save();
                            canvas.FillStyle = "green";
                            canvas.FillRect(m.Item3.Left, m.Item3.Top, m.Item3.Width, m.Item3.Height);
                            canvas.Restore();
                        }
                        else
                        {
                            canvas.Save();
                            canvas.FillStyle = "blue";
                            canvas.FillRect(m.Item3.Left, m.Item3.Top, m.Item3.Width, m.Item3.Height);
                            canvas.Restore();
                        }
                    }
                }

                foreach (Tuple<IntPoint, IntPoint, Rect> m in vf)
                {
                    int i1 = (m.Item1.X) * BlockSize - CurrentMazePoint.X * BlockSize + positionOffset.X;
                    int a1 = (m.Item1.Y) * BlockSize - CurrentMazePoint.Y * BlockSize + positionOffset.Y;
                    if (i1 > -BlockSize && i1 < myWidth / scaleOffset && a1 > -BlockSize && a1 < myHeight / scaleOffset)
                        drawCircle(canvas, m.Item2.X, m.Item2.Y, "purple", lineSize * 2);
                }

                drawCircle(canvas,
                           CurrentMazePoint.X * BlockSize + (BlockSize / 2),
                           CurrentMazePoint.Y * BlockSize + (BlockSize / 2),
                           "red",
                           lineSize * 4);
            }
            else if (vf.Count == 1)
            {
                drawCircle(canvas,
                           CurrentMazePoint.X * BlockSize + (BlockSize / 2),
                           CurrentMazePoint.Y * BlockSize + (BlockSize / 2),
                           "red",
                           lineSize * 4);
            }
            else if (vf.Count == 0) { }
            canvas.Restore();
        }

        private void drawCircle(CanvasContext2D context, int x, int y, object radgrad, double size)
        {
            context.Save();
            context.Translate(x, y);
            context.FillStyle = radgrad;
            context.BeginPath();
            context.Arc(0, 0, size / 2, 0, Math.PI * 2, true);
            context.ClosePath();
            context.Fill();
            context.Restore();
        }

        public void Resize(int width, int height)
        {
            myWidth = width;
            myHeight = height;
            draw();

        }
    }
}