using System;
using System.Collections.Generic;
using System.Html.Media.Graphics;
using CommonLibraries;
using MazeItCommon;
namespace MazeItClient
{
    internal class MazeGameClient : MazeGame
    {
        private readonly MazeGameClientPlayer myCurrent;
        private readonly CanvasInformation myMainCanvasInfo;
        private readonly CanvasInformation myPlaceCanvasInfo;
        private readonly Program myProgram;
        private int BlockSize = 20;
        public bool dragging = false;
        private int lineSize = 2;
        private int myHeight;
        private int myWidth;
        private IntPoint positionOffset = new IntPoint(0, 0);
        private float scaleOffset = 1;
        public bool scaling = false;
        private IntPoint startMouse;
        public Builder CurrentBuilder
        {
            get { return MazeBuilders[myCurrent.ID]; }
        }

        public MazeGameClient(Program program, int width, int height, CanvasInformation mainCanvasInfo, CanvasInformation placeCanvasInfo, List<MazeGameClientPlayer> players, MazeGameClientPlayer current, MazeData loadedData)
                : base(players, current, loadedData)
        {
            myProgram = program;
            myWidth = width;
            myHeight = height;
            myMainCanvasInfo = mainCanvasInfo;
            myPlaceCanvasInfo = placeCanvasInfo;
            myCurrent = current;

            Draw();
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

            if (dragging) {
                positionOffset.X += pd.X;
                positionOffset.Y += pd.Y;
                Draw();
                return;
            }
            if (scaling) {
                scaleOffset = (float) Math.Max(scaleOffset + pd.Y / 100f, 0.35);
                Draw();
                return;
            }
            bool b = false;
            var direction = getDirection(pd);
            switch (direction) {
                case WallPiece.North:
                    b = CurrentBuilder.AddMazePoint(new IntPoint(CurrentBuilder.CurrentMazePoint.X, CurrentBuilder.CurrentMazePoint.Y - 1));
                    break;
                case WallPiece.South:
                    b = CurrentBuilder.AddMazePoint(new IntPoint(CurrentBuilder.CurrentMazePoint.X, CurrentBuilder.CurrentMazePoint.Y + 1));
                    break;
                case WallPiece.West:
                    b = CurrentBuilder.AddMazePoint(new IntPoint(CurrentBuilder.CurrentMazePoint.X - 1, CurrentBuilder.CurrentMazePoint.Y));
                    break;
                case WallPiece.East:
                    b = CurrentBuilder.AddMazePoint(new IntPoint(CurrentBuilder.CurrentMazePoint.X + 1, CurrentBuilder.CurrentMazePoint.Y));
                    break;
            }
            if (b) {
                myProgram.PushMoveDirection(new MoveDirection(direction, CurrentBuilder.Points.Count));
                Draw();
            }
            startMouse = lastMous;
        }

        private WallPiece getDirection(IntPoint pd)
        {
            if (pd.X < 0) {
                if (Math.Abs(pd.X) > Math.Abs(pd.Y))
                    return WallPiece.East;
            }
            if (pd.X >= 0) {
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
            return new IntPoint(( lastMous.X - startMouse.X ), ( lastMous.Y - startMouse.Y ));
        }

        public void Draw()
        {
            positionOffset.X = Math.Max(Math.Min(( myWidth / 2 ) - CurrentBuilder.CurrentMazePoint.X * BlockSize, ( myWidth / 8 )), -Data.MazeSize * BlockSize + ( myWidth - ( myWidth / 8 ) ));
            positionOffset.Y = Math.Max(Math.Min(( myHeight / 2 ) - CurrentBuilder.CurrentMazePoint.Y * BlockSize, ( myHeight / 8 )), -Data.MazeSize * BlockSize + ( myHeight - ( myHeight / 8 ) ));

            var canvas = myMainCanvasInfo.Context;
            canvas.Save();
            canvas.ClearRect(0, 0, myWidth, myHeight);

            canvas.FillStyle = "white";

            canvas.Translate(positionOffset.X,
                             positionOffset.Y);
            canvas.Scale(scaleOffset, scaleOffset);

            canvas.LineCap = LineCap.Round;
            canvas.LineJoin = LineJoin.Round;

            for (int i = 0; i < Data.MazeSize; i++) {
                for (int a = 0; a < Data.MazeSize; a++) {
                    int i1 = ( i ) * BlockSize + positionOffset.X;
                    int a1 = ( a ) * BlockSize + positionOffset.Y;
                    if (i1 > -BlockSize && i1 < myWidth / scaleOffset && a1 > -BlockSize && a1 < myHeight / scaleOffset) {
                        if (Data.Walls[i][a].Contains(WallPiece.West))
                            canvas.FillRect(( i + 1 ) * BlockSize, ( a ) * BlockSize - lineSize * 2, lineSize, BlockSize + lineSize * 2);
                        if (Data.Walls[i][a].Contains(WallPiece.East))
                            canvas.FillRect(( i ) * BlockSize - lineSize, ( a ) * BlockSize - lineSize * 2, lineSize, BlockSize + lineSize * 2);
                        if (Data.Walls[i][a].Contains(WallPiece.North))
                            canvas.FillRect(( i ) * BlockSize - lineSize * 2, ( a ) * BlockSize, BlockSize + lineSize * 2, lineSize);
                        if (Data.Walls[i][a].Contains(WallPiece.South))
                            canvas.FillRect(( i ) * BlockSize - lineSize * 2, ( a + 1 ) * BlockSize - lineSize, BlockSize + lineSize * 2, lineSize);
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

            canvas.Translate(positionOffset.X,
                             positionOffset.Y);
            canvas.Scale(scaleOffset, scaleOffset);

            int[] offsets = new[] {0, 1, -1, 2, -2, 3, -3};
            int index = 0;
            foreach (var mazeBuilder in MazeBuilders) {
                var currentBuilder = mazeBuilder.Value;

                List<Tuple<IntPoint, IntPoint, Rect>> vf = currentBuilder.Blockify(BlockSize, offsets[index++]);

                int inj = vf.Count;
                if (inj > 1) {
                    foreach (Tuple<IntPoint, IntPoint, Rect> m in vf) {
                        int i1 = ( m.Item1.X ) * BlockSize + positionOffset.X;
                        int a1 = ( m.Item1.Y ) * BlockSize + positionOffset.Y;
                        if (i1 > -BlockSize && i1 < myWidth / scaleOffset && a1 > -BlockSize && a1 < myHeight / scaleOffset) {
                            if (currentBuilder.NumHits[m.Item1.X][m.Item1.Y]) {
                                canvas.Save();
                                canvas.FillStyle = Extensions.ShadeColor(currentBuilder.Color, 40);
                                canvas.FillRect(m.Item3.Left, m.Item3.Top, m.Item3.Width, m.Item3.Height);
                                canvas.Restore();
                            } else {
                                canvas.Save();
                                canvas.FillStyle = Extensions.ShadeColor(currentBuilder.Color, -40);
                                canvas.FillRect(m.Item3.Left, m.Item3.Top, m.Item3.Width, m.Item3.Height);
                                canvas.Restore();
                            }
                        }
                    }

                    foreach (Tuple<IntPoint, IntPoint, Rect> m in vf) {
                        int i1 = ( m.Item1.X ) * BlockSize + positionOffset.X;
                        int a1 = ( m.Item1.Y ) * BlockSize + positionOffset.Y;
                        if (i1 > -BlockSize && i1 < myWidth / scaleOffset && a1 > -BlockSize && a1 < myHeight / scaleOffset)
                            drawCircle(canvas, m.Item2.X, m.Item2.Y, "purple", lineSize * 2);
                    }

                    drawCircle(canvas,
                               currentBuilder.CurrentMazePoint.X * BlockSize + ( BlockSize / 2 ),
                               currentBuilder.CurrentMazePoint.Y * BlockSize + ( BlockSize / 2 ),
                               currentBuilder.Color,
                               lineSize * 5);
                } else if (vf.Count == 1) {
                    drawCircle(canvas,
                               currentBuilder.CurrentMazePoint.X * BlockSize + ( BlockSize / 2 ),
                               currentBuilder.CurrentMazePoint.Y * BlockSize + ( BlockSize / 2 ),
                               currentBuilder.Color,
                               lineSize * 5);
                } else if (vf.Count == 0) {}
            }

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
            Draw();
        }
    }
}