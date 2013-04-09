using System;
using System.Runtime.CompilerServices;
namespace MazeItServer
{
    public class MazeGamePlayer
    {
        [IntrinsicProperty]
        public int ID { get; set; }
        [IntrinsicProperty]
        public Action<string, object> SendMessage { get; set; }

        public MazeGamePlayer(int id, Action<string, object> sendMessage)
        {
            ID = id;
            SendMessage = sendMessage;
        }
    }
}