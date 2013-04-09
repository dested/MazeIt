using System.Collections.Generic;
using CommonLibraries;
using MazeItCommon;
using NodeJSLibrary;
using SocketIONodeLibrary;
namespace MazeItServer
{
    internal class Program
    {
        static Program()
        {
            Global.Require("./mscorlib");
            Global.Require("./CommonLibraries");
            Global.Require("./NodeLibraries");
            Global.Require("./MazeItCommon");
        }

        private static void Main()
        {
            //ExtensionMethods.debugger(""); 

            var http = Global.Require<Http>("http");
            var app = http.CreateServer((req, res) => res.End());

            var io = Global.Require<SocketIO>("socket.io").Listen(app);
            var fs = Global.Require<FS>("fs");
            app.Listen(4484);
            io.Set("log level", 0);
            var server = new MazeServer();

            int count = 0;
            io.Sockets.On("connection",
                          (SocketIOConnection socket) => {
                              var userID = count++;
                              Console.Log("User Joined " + userID);

                              server.AddPlayer(userID, socket.Emit);
                              socket.On("WaitingRoom.VoteStart",
                                        (object data) => { server.ChangeVoteStart(userID, (bool) data); });
                              socket.On("GameRoom.PlayerMoves",
                                        (object data) => { server.MovePlayer(userID, (List<MoveDirection>) data); });
                              socket.On("disconnect",
                                        (string data) => {
                                            Console.Log("User Left " + userID);

                                            server.RemovePlayer(userID);
                                        });
                          });
        }
    }
}