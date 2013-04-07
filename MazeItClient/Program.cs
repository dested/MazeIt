using System;
using System.Collections.Generic;
using System.Html;
using System.Html.Media.Graphics;
using System.Runtime.CompilerServices;
using CommonLibraries;
using WebLibraries.Common;
using jQueryApi;
namespace Blockade
{
    internal class Program
	{
		private int BlockSize = 20;
		private IntPoint CurrentMazePoint;
		private IntPoint startMouse;

        private CanvasInformation PlaceCanvasInfo;
        private CanvasInformation MazeCanvasInfo;
        private int myWidth;
        private int myHeight;
        [IntrinsicProperty]
		private MazeData data { get; set; }
		public Program() {}

		private static void Main()
		{
			jQuery.OnDocumentReady(new Program().Start);
		}

		private void TouchDown(int x, int y)
		{
			startMouse = new IntPoint(x, y);
		}

		private void TouchDrag(int x, int y)
		{
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
                if (scaleOffset < 0.25) {
                    return;
                }
                scaleOffset+= pd.Y/100f;
                draw();
                return;
            }
            bool b = false;
			switch (getDirection(pd)) {
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
			startMouse = lastMous;
		}

		private IntPoint PointDifference(IntPoint startMouse, IntPoint lastMous)
		{
			return new IntPoint(( lastMous.X - startMouse.X ), ( lastMous.Y - startMouse.Y ));
		}

		private bool AddMazePoint(IntPoint p0)
		{
			bool d;
			if (d=(data.MazeBuilder.AddIntPoint(p0, false) == Status.Good)) {
				CurrentMazePoint = p0;
			    draw();
			}
			return d;
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

		public static Pointer GetCursorPosition(jQueryEvent ev)
		{
			if (ev.Me().originalEvent && ev.Me().originalEvent.targetTouches && ev.Me().originalEvent.targetTouches.length > 0) ev = ev.Me().originalEvent.targetTouches[0];

			if (ev.PageX.Me() != null && ev.PageY.Me() != null)
				return new Pointer(ev.PageX, ev.PageY, 0, ev.Which == 3);
			//if (ev.x != null && ev.y != null) return new { x: ev.x, y: ev.y };
			return new Pointer(ev.ClientX, ev.ClientY, 0, ev.Which == 3);
		}

        IntPoint positionOffset = new IntPoint(0, 0);
        float scaleOffset = 1;
        private bool dragging = false;
        private bool scaling = false;
		private void Start()
		{
			var stats = new XStats();
            KeyboardJS.Instance().Bind.Key("ctrl",
                                           () =>
                                           {
                                               dragging = true;
                                           },
                                           () =>
                                           {
                                               dragging = false;
                                           });
            KeyboardJS.Instance().Bind.Key("shift",
                                           () =>
                                           {
                                               scaling = true;
                                           },
                                           () =>
                                           {
                                               scaling = false;
                                           });

			Document.Body.AppendChild(stats.Element);
			CurrentMazePoint = new IntPoint(0, 0);
			data = new MazeData(100);

			Carver carver = new Carver(data);
            carver.Walk();

			myWidth = jQuery.Window.GetWidth() - 40;
			myHeight = jQuery.Window.GetHeight() - 40;

/*
            var @lock=Document.Body.me().requestPointerLock ||
                Document.Body.me().mozRequestPointerLock ||
                Document.Body.me().webkitRequestPointerLock;
		    @lock();
*/

            Setup();

            draw();

		}

        private void Setup()
        {
            MazeCanvasInfo = CanvasInformation.Create(myWidth, myHeight);
            jQuery.FromElement(Document.Body).Append(MazeCanvasInfo.Canvas);
            MazeCanvasInfo.Canvas.Style.Position = "absolute";
            MazeCanvasInfo.Canvas.Style.Left = "0";
            MazeCanvasInfo.Canvas.Style.Top = "0";
            PlaceCanvasInfo = CanvasInformation.Create(myWidth, myHeight);
            jQuery.FromElement(Document.Body).Append(PlaceCanvasInfo.Canvas);
            PlaceCanvasInfo.Canvas.Style.Position = "absolute";
            PlaceCanvasInfo.Canvas.Style.Left = "0";
            PlaceCanvasInfo.Canvas.Style.Top = "0";

            PlaceCanvasInfo.DomCanvas.MouseMove(a => {
                                                    a.PreventDefault();
                                                    if (startMouse == null) return;
                                                    Pointer cursorPosition = GetCursorPosition(a);
                                                    TouchDrag((int) cursorPosition.X, (int) cursorPosition.Y);
                                                });
            PlaceCanvasInfo.DomCanvas.MouseDown(a => {
                                                    a.PreventDefault();

                                                    Pointer cursorPosition = GetCursorPosition(a);
                                                    TouchDown((int) cursorPosition.X, (int) cursorPosition.Y);
                                                });

            PlaceCanvasInfo.DomCanvas.MouseUp(a => {
                                                  a.PreventDefault();
                                                  startMouse = null;
                                              });
        }

        int lineSize = 2;

        private void draw()
        {

            var canvas = MazeCanvasInfo.Context;
            canvas.Save();
            canvas.ClearRect(0, 0, myWidth, myHeight);
            canvas.FillStyle = "black";

            //canvas.FillRect(0, 0, width, height);

            canvas.FillStyle = "white";
            canvas.Translate(myWidth / 2
                             - CurrentMazePoint.X * BlockSize
                             + positionOffset.X,
                             myHeight / 2
                             - CurrentMazePoint.Y * BlockSize
                             + positionOffset.Y);
            canvas.Scale(scaleOffset, scaleOffset);
            canvas.LineCap = LineCap.Round;
            canvas.LineJoin = LineJoin.Round;

         

                for (int i = 0; i < data.MazeSize; i++)
                {
                    for (int a = 0; a < data.MazeSize; a++)
                    {
                        if (data.Walls[i, a].Contains(WallPiece.West)) canvas.FillRect((i + 1) * BlockSize, (a) * BlockSize, lineSize, BlockSize);
                        if (data.Walls[i, a].Contains(WallPiece.East)) canvas.FillRect((i) * BlockSize - lineSize, (a) * BlockSize, lineSize, BlockSize);
                        if (data.Walls[i, a].Contains(WallPiece.North)) canvas.FillRect((i) * BlockSize, (a) * BlockSize, BlockSize, lineSize);
                        if (data.Walls[i, a].Contains(WallPiece.South)) canvas.FillRect((i) * BlockSize, (a + 1) * BlockSize - lineSize, BlockSize, lineSize);
                    }

                   
                }
            drawPlace();
            canvas.Restore();

        }

        private void drawPlace( )
        {
            var canvas = PlaceCanvasInfo.Context;
            canvas.Save();

            canvas.ClearRect(0, 0, myWidth, myHeight);
            canvas.Translate(myWidth / 2
                             - CurrentMazePoint.X * BlockSize
                             + positionOffset.X,
                             myHeight / 2
                             - CurrentMazePoint.Y * BlockSize
                             + positionOffset.Y);
            canvas.Scale(scaleOffset, scaleOffset);

            canvas.LineCap = LineCap.Round;
            canvas.LineJoin = LineJoin.Round;
            List<IntPoint> vf = data.MazeBuilder.Magnify(BlockSize);

            int inj = vf.Count;
            if (inj > 1) {
                int fj = 0;
                foreach (Tuple<IntPoint, Rect> m in toRects(vf)) {
                    fj++;
                    IntPoint pt = data.MazeBuilder.Points[fj];

                    if (data.MazeBuilder.NumHits[pt.X, pt.Y]) {
                        canvas.Save();
                        canvas.FillStyle = "green";
                        canvas.FillRect(m.Item2.Left, m.Item2.Top, m.Item2.Width, m.Item2.Height);
                        canvas.Restore();
                    } else {
                        canvas.Save();
                        canvas.FillStyle = "blue";
                        canvas.FillRect(m.Item2.Left, m.Item2.Top, m.Item2.Width, m.Item2.Height);
                        canvas.Restore();
                    }
                }

                drawCircle(canvas,
                           CurrentMazePoint.X * BlockSize + ( BlockSize / 2 ),
                           CurrentMazePoint.Y * BlockSize + ( BlockSize / 2 ),
                           "red",
                           lineSize*4);
            } else if (vf.Count == 1) {
                drawCircle(canvas,
                           CurrentMazePoint.X * BlockSize + ( BlockSize / 2 ),
                           CurrentMazePoint.Y * BlockSize + ( BlockSize / 2 ),
                           "red",
                           lineSize * 4);
            } else if (vf.Count == 0) {}
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

		public static List<Tuple<IntPoint, Rect>> toRects(List<IntPoint> vf)
		{
			List<Tuple<IntPoint, Rect>> lst = new List<Tuple<IntPoint, Rect>>();

			for (int index = 0; index < vf.Count - 1; index++) {
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

				lst.Add(new Tuple<IntPoint, Rect>(point, cur));
			}
			return lst;
		}
	}
}