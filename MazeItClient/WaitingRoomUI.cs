using WebLibraries.ShuffUI.ShuffUI;
using jQueryApi;
namespace MazeItClient
{
    internal class WaitingRoomUI
    {
        private ShuffWindow UIWindow;
        private bool currentVote = false;

        public WaitingRoomUI(ShuffUIManager shuffUIManager, Program program)
        {
            UIWindow = shuffUIManager.CreateWindow(new ShuffWindow() {
                                                                             Title = "Login",
                                                                             X = jQuery.Select("body").GetInnerWidth() - 500,
                                                                             Y = 100,
                                                                             Width = 280,
                                                                             Height = 165,
                                                                             AllowClose = true,
                                                                             AllowMinimize = true,
                                                                             Visible = true
                                                                     });

            ShuffLabel playersInRoom;
            ShuffLabel voteCountPlayers;
            UIWindow.AddElement(playersInRoom = new ShuffLabel(40, 40, "Players in waiting room: " + 0));
            UIWindow.AddElement(voteCountPlayers = new ShuffLabel(40, 80, "Players voted to start: " + 0));

            UIWindow.AddElement(new ShuffButton(55,
                                                150,
                                                90,
                                                30,
                                                "Vote To Start",
                                                (e) => {
                                                    currentVote = !currentVote;
                                                    program.client.Emit("WaitingRoom.VoteStart", currentVote);
                                                }));

            program.client.On<int>("WaitingRoom.PlayerCountChanged", data => { playersInRoom.Text = "Players in waiting room: " + data; });
            program.client.On<int>("WaitingRoom.VoteStartChanged", data => { voteCountPlayers.Text = "Players voted to start: " + data; });
            program.client.On<string>("WaitingRoom.GameBeginning", data => { UIWindow.SwingAway(SwingDirection.Left); });
        }
    }
}