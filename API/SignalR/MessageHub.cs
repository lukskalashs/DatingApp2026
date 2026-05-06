using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

[Authorize]
public class MessageHub(IMessageRepository messageRepository, 
                        IMemberRepository memberRepository, IHubContext<PresenceHub> presenceHub) : Hub  // ✅ use interface
{
   public override async Task OnConnectedAsync()
{
    try
    {
        var httpContext = Context.GetHttpContext();
        var currentUserId = GetUserId();
        var otherUser = httpContext?.Request?.Query["userId"].ToString();

        Console.WriteLine($"MessageHub connected: currentUser={currentUserId}, otherUser={otherUser}");

        if (string.IsNullOrEmpty(otherUser))
            throw new HubException("otherUser userId is missing from query string");

        var groupName = GetGroupName(currentUserId, otherUser);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        await AddToGroup(groupName);

        var messages = await messageRepository.GetMessageThread(currentUserId, otherUser);

        Console.WriteLine($"Sending {messages.Count} messages to caller");

        await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"MessageHub OnConnectedAsync error: {ex.Message}");
        throw;
    }
}
    public async Task SendMessage(CreateMessageDto createMessageDto)
    {
        var sender = await memberRepository.GetMemberByIdAsync(GetUserId());
        var recipient = await memberRepository.GetMemberByIdAsync(createMessageDto.RecipientId);

        if (recipient == null || sender == null || sender.Id == createMessageDto.RecipientId)
            throw new HubException("Cannot send message");

        var message = new Message
        {
            SenderId = sender.Id,
            RecipientId = recipient.Id,
            Content = createMessageDto.Content
        };

        var groupName = GetGroupName(sender.Id, recipient.Id);

        var group = await messageRepository.GetMessageGroup(groupName);

        var userInGroup = group != null && group.Connections.Any(x => x.UserId == message.RecipientId);

        if(userInGroup)
        {
            message.DateRead = DateTime.UtcNow;
        }

        messageRepository.AddMessage(message);

        if (await messageRepository.SaveAllAsync())
        {
           
            // ✅ Consistent casing with client
            await Clients.Group(groupName).SendAsync("NewMessage", message.ToDto());

            var connections = await PresenceTracker.GetConnectionsForUser(recipient.Id);

            if(connections != null && connections.Count > 0 && !userInGroup)
            {
                await presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived", message.ToDto());
            }
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await messageRepository.RemoveConnection(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    private static string GetGroupName(string? caller, string? other)
    {
        var stringCompare = string.CompareOrdinal(caller, other) < 0;
        return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    }

    private string GetUserId()
    {
        return Context.User?.GetMemberId()
            ?? throw new HubException("Cannot get member id");
    }
    private async Task<bool> AddToGroup(string groupName)
    {
        var group = await messageRepository.GetMessageGroup(groupName);
        var connection = new Connection(Context.ConnectionId, GetUserId());

        if (group == null)
        {
            group = new Group(groupName);
            messageRepository.AddGroup(group);
        }

        group.Connections.Add(connection);

        return await messageRepository.SaveAllAsync();
    }
}