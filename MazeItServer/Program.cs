using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NodeJSLibrary;
using SocketIONodeLibrary;
namespace BlockadeServer
{
    class Program
    {
        static void Main()
        {
            //ExtensionMethods.debugger(""); 
            var http = Global.Require<Http>("http");
            var app = http.CreateServer((req, res) => res.End());

            var io = Global.Require<SocketIO>("socket.io").Listen(app);
            var fs = Global.Require<FS>("fs");
            var port = 1800 + Math.Truncate((int)(Math.Random() * 4000));

            app.Listen(port);
            io.Set("log level", 0);

            io.Sockets.On("connection",
                          (SocketIOConnection socket) =>
                          {
                              socket.On("Gateway.Message",
                                        (object data) =>
                                        {
                                        });


                              socket.On("disconnect",
                                        (string data) =>
                                        {
                                        });
                          });
        }
    }
}
