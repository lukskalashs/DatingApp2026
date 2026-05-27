using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;

namespace API.Interfaces
{
    public interface IBlockRepository
    {
       Task<BlockMember?> GetBlockAsync(string sourceMemberId, string targetMemberId);
       void AddBlock(BlockMember block);
       Task<IEnumerable<BlockedMemberDto>> GetBlockedMembersAsync(string sourceMemberId);
       void RemoveBlock(BlockMember block);
    }
}