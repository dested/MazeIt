using System;
using System.Collections.Generic;
using System.Html;
using CommonLibraries;
using MazeItCommon;
using WebLibraries.Common;
using WebLibraries.ShuffUI.ShuffUI;
using WebLibraries.SocketIOClient;
using jQueryApi;
namespace MazeItClient
{
    internal class Program
    {
        private CanvasInformation MazeCanvasInfo;
        private MazeGameClient MazeGame;
        private CanvasInformation PlaceCanvasInfo;
        public SocketIOClient client;
        private float myHeight;
        private float myWidth;
        private ShuffUIManager shuffUIManager;
        public Program() { }

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

            var stats = new XStats();
            Document.Body.AppendChild(stats.Element);
            client = SocketIOClient.Connect("198.211.107.235:4484");

            Window.Instance.AddEventListener("scroll",
                                             (e) =>
                                             {
                                                 Window.ScrollTo(0, 0);
                                                 e.StopImmediatePropagation();
                                             });

            shuffUIManager = new ShuffUIManager();
            var waitingRoom = new WaitingRoomUI(shuffUIManager, this);

            List<MazeGameClientPlayer> players = null;
            MazeGameClientPlayer currentPlayer = null;
            int currentPlayerID = 0;
            client.On<MazeGameClientPlayer>("MazeGame.PlayerLeft",
                                            data =>
                                            {
                                                MazeGame.MazeBuilders.Remove(data.ID);
                                                MazeGame.Draw();
                                            });
            client.On<int>("MazeGame.PlayerWon", data => { Window.Alert("Player " + data + " Won!"); });

            List<PlayerPositionUpdate> updates = new List<PlayerPositionUpdate>();


            client.On<List<PlayerPositionUpdate>>("MazeGame.PlayerPositionUpdates",
                                            data => {
                                                updates.AddRange(data);
                                            });

            Window.SetInterval(() => {
                if (updates.Count > 0) {
                    var update = updates[0];
                    MazeGame.MazeBuilders[update.ID].Navigate(update.Navigate);
                    MazeGame.Draw();
                    updates.RemoveAt(0);

                }
                               },75);
            client.On<MazeData>("MazeGame.MazeData", data =>
            {

                SetupGame(players, currentPlayer, new MazeData(data.MazeSize, data.Walls));
            });

            client.On<List<MazeGameClientPlayer>>("MazeGame.PlayerInfo",
                                                  data =>
                                                  {
                                                      foreach (var mazeGameClientPlayer in data)
                                                      {
                                                          if (mazeGameClientPlayer.ID == currentPlayerID)
                                                              currentPlayer = mazeGameClientPlayer;
                                                      }
                                                      players = data;
                                                  });
            client.On<int>("MazeGame.PlayerReflect", data => { currentPlayerID = data; });

            //  SetupGame();

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
            MazeGame.Resize((int)myWidth, (int)myHeight);
        }

        private void SetupGame(List<MazeGameClientPlayer> players, MazeGameClientPlayer current, MazeData loadedData)
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
                Pointer cursorPosition = GetCursorPosition(a);
                MazeGame.TouchDrag((int)cursorPosition.X, (int)cursorPosition.Y);
            });
            PlaceCanvasInfo.DomCanvas.Bind("touchstart",
                                           a =>
                                           {
                                               a.PreventDefault();

                                               Pointer cursorPosition = GetCursorPosition(a);
                                               MazeGame.TouchDown((int)cursorPosition.X, (int)cursorPosition.Y);
                                           });
            PlaceCanvasInfo.DomCanvas.Bind("touchend",
                                           a =>
                                           {
                                               a.PreventDefault();
                                               MazeGame.TouchEnd();
                                           });
            PlaceCanvasInfo.DomCanvas.Bind("touchmove",
                                           a =>
                                           {
                                               a.PreventDefault();
                                               Pointer cursorPosition = GetCursorPosition(a);
                                               MazeGame.TouchDrag((int)cursorPosition.X, (int)cursorPosition.Y);
                                           });

            PlaceCanvasInfo.DomCanvas.MouseDown(a =>
            {
                a.PreventDefault();

                Pointer cursorPosition = GetCursorPosition(a);
                MazeGame.TouchDown((int)cursorPosition.X, (int)cursorPosition.Y);
            });

            PlaceCanvasInfo.DomCanvas.MouseUp(a =>
            {
                a.PreventDefault();
                MazeGame.TouchEnd();
            });

            KeyboardJS.Instance().Bind.Key("ctrl",
                                           () => { MazeGame.dragging = true; },
                                           () => { MazeGame.dragging = false; });
/*
            KeyboardJS.Instance().Bind.Key("shift",
                                           () => { MazeGame.scaling = true; },
                                           () => { MazeGame.scaling = false; });
*/

            Window.AddEventListener("resize", e => resizeCanvas());
            jQuery.Document.Resize(e => resizeCanvas());

            Window.SetInterval(flushMoveQueue, 500);

            MazeGame = new MazeGameClient(this, (int)myWidth, (int)myHeight, MazeCanvasInfo, PlaceCanvasInfo, players, current, loadedData);
        }

        public void flushMoveQueue()
        {

            if (directions.Count > 0)
            {
                /*
                                foreach (var moveDirection in directions) {
                                    Console.Log("Moving: "+moveDirection.Index);
                                }
                */
                client.Emit("GameRoom.PlayerMoves", directions);
                directions = new List<MoveDirection>();
            }
        }

        List<MoveDirection> directions = new List<MoveDirection>();

        public void PushMoveDirection(MoveDirection direction)
        {
            Console.Log("Attempting Move: " + direction.Index);

            directions.Add(direction);

        }
    }
}