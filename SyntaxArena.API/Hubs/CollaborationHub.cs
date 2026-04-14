using Microsoft.AspNetCore.SignalR;

namespace SyntaxArena.API.Hubs
{
    public class CollaborationHub : Hub
    {
        // Users join a group specific to the assessment session
        public async Task JoinSession(string sessionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
            await Clients.Group(sessionId).SendAsync("UserJoined", Context.ConnectionId);
        }

        public async Task LeaveSession(string sessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
            await Clients.Group(sessionId).SendAsync("UserLeft", Context.ConnectionId);
        }

        // Yjs CRDT Sync
        public async Task SendYJsUpdate(string sessionId, byte[] update)
        {
            // Broadcast the CRDT state update to everyone else in the session
            await Clients.GroupExcept(sessionId, Context.ConnectionId)
                .SendAsync("ReceiveYJsUpdate", update);
        }

        // WebRTC Signaling
        public async Task SendWebRTCOffer(string toConnectionId, string offer)
        {
            await Clients.Client(toConnectionId).SendAsync("ReceiveWebRTCOffer", Context.ConnectionId, offer);
        }

        public async Task SendWebRTCAnswer(string toConnectionId, string answer)
        {
            await Clients.Client(toConnectionId).SendAsync("ReceiveWebRTCAnswer", Context.ConnectionId, answer);
        }

        public async Task SendICECandidate(string toConnectionId, string candidate)
        {
            await Clients.Client(toConnectionId).SendAsync("ReceiveICECandidate", Context.ConnectionId, candidate);
        }
    }
}
