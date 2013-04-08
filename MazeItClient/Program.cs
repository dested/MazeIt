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
		private CanvasInformation MazeCanvasInfo;
		private CanvasInformation PlaceCanvasInfo;
		private bool dragging = false;
		private int lineSize = 2;
		private float myHeight;
		private float myWidth;
		private IntPoint positionOffset = new IntPoint(0, 0);
		private float scaleOffset = 1;
		private bool scaling = false;
		private IntPoint startMouse;
		[IntrinsicProperty]
		private MazeData data { get; set; }
		public Program() { }

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
			startMouse = lastMous;
		}

		private IntPoint PointDifference(IntPoint startMouse, IntPoint lastMous)
		{
			return new IntPoint((lastMous.X - startMouse.X), (lastMous.Y - startMouse.Y));
		}

		private bool AddMazePoint(IntPoint p0)
		{
			bool d;
			if (d = (data.MazeBuilder.AddIntPoint(p0, false) == Status.Good))
			{
				CurrentMazePoint = p0;
				draw();
			}
			return d;
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

		public static Pointer GetCursorPosition(jQueryEvent ev)
		{
			if (ev.Me().originalEvent && ev.Me().originalEvent.targetTouches && ev.Me().originalEvent.targetTouches.length > 0) ev = ev.Me().originalEvent.targetTouches[0];

			if (ev.PageX.Me() != null && ev.PageY.Me() != null)
				return new Pointer(ev.PageX, ev.PageY, 0, ev.Which == 3);
			//if (ev.x != null && ev.y != null) return new { x: ev.x, y: ev.y };
			return new Pointer(ev.ClientX, ev.ClientY, 0, ev.Which == 3);
		}

		private void Start()
		{
			var stats = new XStats();
			KeyboardJS.Instance().Bind.Key("ctrl",
										   () => { dragging = true; },
										   () => { dragging = false; });
			KeyboardJS.Instance().Bind.Key("shift",
										   () => { scaling = true; },
										   () => { scaling = false; });

			Window.AddEventListener("resize", e => resizeCanvas());
			jQuery.Document.Resize(e => resizeCanvas());

			Document.Body.AppendChild(stats.Element);
			CurrentMazePoint = new IntPoint(0, 0);
			data = new MazeData(50);

			Carver carver = new Carver(data);
			carver.Walk();

			myWidth = jQuery.Window.GetWidth();
			myHeight = jQuery.Window.GetHeight();
			
						positionOffset.X += (int)(myWidth / 8);
						positionOffset.Y += (int)(myHeight / 8);
			
			/*
						var @lock=Document.Body.me().requestPointerLock ||
							Document.Body.me().mozRequestPointerLock ||
							Document.Body.me().webkitRequestPointerLock;
						@lock();
			*/

			Setup();

			draw();
		}

		private void resizeCanvas()
		{
			myWidth = jQuery.Window.GetWidth();
			myHeight = jQuery.Window.GetHeight();

			PlaceCanvasInfo.DomCanvas.Attribute("width", myWidth.ToString());
			PlaceCanvasInfo.DomCanvas.Attribute("height", myHeight.ToString());

			MazeCanvasInfo.DomCanvas.Attribute("width", myWidth.ToString());
			MazeCanvasInfo.DomCanvas.Attribute("height", myHeight.ToString());

			draw();
		}

		private void Setup()
		{
			MazeCanvasInfo = CanvasInformation.Create((int)myWidth, (int)myHeight);
			jQuery.FromElement(Document.Body).Append(MazeCanvasInfo.Canvas);
			MazeCanvasInfo.Canvas.Style.Position = "absolute";
			MazeCanvasInfo.Canvas.Style.Left = "0";
			MazeCanvasInfo.Canvas.Style.Top = "0";
			PlaceCanvasInfo = CanvasInformation.Create((int)myWidth, (int)myHeight);
			jQuery.FromElement(Document.Body).Append(PlaceCanvasInfo.Canvas);
			PlaceCanvasInfo.Canvas.Style.Position = "absolute";
			PlaceCanvasInfo.Canvas.Style.Left = "0";
			PlaceCanvasInfo.Canvas.Style.Top = "0";

			PlaceCanvasInfo.DomCanvas.MouseMove(a =>
			{
				a.PreventDefault();
				if (startMouse == null) return;
				Pointer cursorPosition = GetCursorPosition(a);
				TouchDrag((int)cursorPosition.X, (int)cursorPosition.Y);
			});
			PlaceCanvasInfo.DomCanvas.Bind("touchstart",
										   a =>
										   {
											   a.PreventDefault();

											   Pointer cursorPosition = GetCursorPosition(a);
											   TouchDown((int)cursorPosition.X, (int)cursorPosition.Y);
										   });
			PlaceCanvasInfo.DomCanvas.Bind("touchend",
										   a =>
										   {
											   a.PreventDefault();
											   startMouse = null;
										   });
			PlaceCanvasInfo.DomCanvas.Bind("touchmove",
										   a =>
										   {
											   a.PreventDefault();
											   if (startMouse == null) return;
											   Pointer cursorPosition = GetCursorPosition(a);
											   TouchDrag((int)cursorPosition.X, (int)cursorPosition.Y);
										   });

			PlaceCanvasInfo.DomCanvas.MouseDown(a =>
			{
				a.PreventDefault();

				Pointer cursorPosition = GetCursorPosition(a);
				TouchDown((int)cursorPosition.X, (int)cursorPosition.Y);
			});

			PlaceCanvasInfo.DomCanvas.MouseUp(a =>
			{
				a.PreventDefault();
				startMouse = null;
			});
		}

		private void draw()
		{
			var canvas = MazeCanvasInfo.Context;
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
			var canvas = PlaceCanvasInfo.Context;
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
                    if (i1 > -BlockSize && i1 < myWidth / scaleOffset && a1 > -BlockSize && a1 < myHeight / scaleOffset) {
                        drawCircle(canvas, m.Item2.X, m.Item2.Y, "purple", lineSize * 2);
                    }
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

	}
}