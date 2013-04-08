using System.Html;
using Blockade;
using MazeItCommon;
using WebLibraries.Common;
using jQueryApi;
namespace MazeItClient
{
    internal class Program
    {
        private CanvasInformation MazeCanvasInfo;
        private MazeGameClient MazeGame;
        private CanvasInformation PlaceCanvasInfo;
        private float myHeight;
        private float myWidth;
        public Program() {}

        private static void Main()
        {
            jQuery.OnDocumentReady(new Program().Start);
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
            myWidth = jQuery.Window.GetWidth();
            myHeight = jQuery.Window.GetHeight();
            Setup();


            var stats = new XStats();
            KeyboardJS.Instance().Bind.Key("ctrl",
                                           () => { MazeGame.dragging = true; },
                                           () => { MazeGame.dragging = false; });
            KeyboardJS.Instance().Bind.Key("shift",
                                           () => { MazeGame.scaling = true; },
                                           () => { MazeGame.scaling = false; });

            Window.AddEventListener("resize", e => resizeCanvas());
            jQuery.Document.Resize(e => resizeCanvas());

            Document.Body.AppendChild(stats.Element);

            /*
						var @lock=Document.Body.me().requestPointerLock ||
							Document.Body.me().mozRequestPointerLock ||
							Document.Body.me().webkitRequestPointerLock;
						@lock();
			*/
             
        }

        private void resizeCanvas()
        {
            myWidth = jQuery.Window.GetWidth();
            myHeight = jQuery.Window.GetHeight();

            PlaceCanvasInfo.DomCanvas.Attribute("width", myWidth.ToString());
            PlaceCanvasInfo.DomCanvas.Attribute("height", myHeight.ToString());

            MazeCanvasInfo.DomCanvas.Attribute("width", myWidth.ToString());
            MazeCanvasInfo.DomCanvas.Attribute("height", myHeight.ToString());
            MazeGame.Resize((int) myWidth, (int) myHeight);
        }

        private void Setup()
        {
            MazeCanvasInfo = CanvasInformation.Create((int) myWidth, (int) myHeight);
            jQuery.FromElement(Document.Body).Append(MazeCanvasInfo.Canvas);
            MazeCanvasInfo.Canvas.Style.Position = "absolute";
            MazeCanvasInfo.Canvas.Style.Left = "0";
            MazeCanvasInfo.Canvas.Style.Top = "0";
            PlaceCanvasInfo = CanvasInformation.Create((int) myWidth, (int) myHeight);
            jQuery.FromElement(Document.Body).Append(PlaceCanvasInfo.Canvas);
            PlaceCanvasInfo.Canvas.Style.Position = "absolute";
            PlaceCanvasInfo.Canvas.Style.Left = "0";
            PlaceCanvasInfo.Canvas.Style.Top = "0";

            PlaceCanvasInfo.DomCanvas.MouseMove(a => {
                                                    a.PreventDefault();
                                                    Pointer cursorPosition = GetCursorPosition(a);
                                                    MazeGame.TouchDrag((int) cursorPosition.X, (int) cursorPosition.Y);
                                                });
            PlaceCanvasInfo.DomCanvas.Bind("touchstart",
                                           a => {
                                               a.PreventDefault();

                                               Pointer cursorPosition = GetCursorPosition(a);
                                               MazeGame.TouchDown((int) cursorPosition.X, (int) cursorPosition.Y);
                                           });
            PlaceCanvasInfo.DomCanvas.Bind("touchend",
                                           a => {
                                               a.PreventDefault();
                                               MazeGame.TouchEnd();
                                           });
            PlaceCanvasInfo.DomCanvas.Bind("touchmove",
                                           a => {
                                               a.PreventDefault();
                                               Pointer cursorPosition = GetCursorPosition(a);
                                               MazeGame.TouchDrag((int) cursorPosition.X, (int) cursorPosition.Y);
                                           });

            PlaceCanvasInfo.DomCanvas.MouseDown(a => {
                                                    a.PreventDefault();

                                                    Pointer cursorPosition = GetCursorPosition(a);
                                                    MazeGame.TouchDown((int) cursorPosition.X, (int) cursorPosition.Y);
                                                });

            PlaceCanvasInfo.DomCanvas.MouseUp(a => {
                                                  a.PreventDefault();
                                                  MazeGame.TouchEnd();
                                              });

            MazeGame = new MazeGameClient((int)myWidth, (int)myHeight, MazeCanvasInfo, PlaceCanvasInfo);

        }
    }
}