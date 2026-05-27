using System.Net.Http.Headers;
using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace API.Controllers
{
     [Authorize(Policy = "RequireVipRole")] // match one in the Program.cs
    public class BlockController(IUnitOfWork uow) : BaseApiController
    {
       [HttpPost("{targetMemberId}")]
       public async Task<ActionResult> BlockMember(string targetMemberId, [FromQuery] string? reason)
       {
            var sourceMemberId = User.GetMemberId();

            if (sourceMemberId == targetMemberId)
                return BadRequest("You cannot block yourself.");

            var targetMember = await uow.MemberRepository.GetMemberByIdAsync(targetMemberId);

            if (targetMember == null)
                return BadRequest("Target member not found.");

            var block = await uow.blockRepository.GetBlockAsync(sourceMemberId, targetMemberId);

            if (block != null)
                return BadRequest("You have already blocked this member.");

            var newBlock = new Entities.BlockMember
            {
                SourceMemberId = sourceMemberId,
                TargetMemberId = targetMemberId,
                Reason = reason
            };

            uow.blockRepository.AddBlock(newBlock);

            if (await uow.Complete())
                return Ok();

            return BadRequest("Failed to block the member.");
       }
       [HttpGet]
        public async Task<ActionResult<IEnumerable<BlockedMemberDto>>> GetBlockedMembers()
        {
            var blockedMembers = await uow.blockRepository.GetBlockedMembersAsync(User.GetMemberId());
            return Ok(blockedMembers);
        }
        [HttpPut("{targetMemberId}")]


        public async Task<ActionResult> UpdateBlockReason(string targetMemberId, [FromBody] BlockReasonDto request)
        {
            var sourceMemberId = User.GetMemberId();
            var block = await uow.blockRepository.GetBlockAsync(sourceMemberId, targetMemberId);

            if (block == null) return NotFound("Block record not found");

            block.Reason = request.Reason;

            if (await uow.Complete()) return NoContent();

            return BadRequest("Problem updating the block reason");
        }
        [HttpDelete("{targetMemberId}")]

        
        public async Task<ActionResult> UnblockMember(string targetMemberId)
        {
            var sourceMemberId = User.GetMemberId();
            var block = await uow.blockRepository.GetBlockAsync(sourceMemberId, targetMemberId);

            if (block == null) return NotFound("Block record not found");

            uow.blockRepository.RemoveBlock(block);

            if (await uow.Complete()) return Ok();

            return BadRequest("Problem unblocking the member");
        }
    }
}