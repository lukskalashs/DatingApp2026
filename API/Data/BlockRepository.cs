using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class BlockRepository(AppDbContext context) : IBlockRepository
    {
       
        public Task<BlockMember?> GetBlockAsync(string sourceMemberId, string targetMemberId)
        {
            //Composite key, (SourceMemberId, TargetMemberId) is the primary key,
            //so we can just add the block without
            // checking for duplicates here, as it will be 
            // handled by the database constraints.
            
            return context.Blocks.FindAsync(sourceMemberId, targetMemberId).AsTask();
        }

        public Task<IEnumerable<BlockedMemberDto>> GetBlockedMembersAsync(string sourceMemberId)
        {
            return context.Blocks
                .Where(b => b.SourceMemberId == sourceMemberId)
                .Select( b => new BlockedMemberDto
                {
                    Id = b.TargetMemberId,
                    DisplayName = b.TargetMember.DisplayName,
                    PhotoUrl = b.TargetMember.ImageUrl,
                    Reason = b.Reason,
                    DateBlocked = b.DateBlocked
                })
                .ToListAsync()
                .ContinueWith(t => t.Result.AsEnumerable());       }

        // public async Task<IEnumerable<BlockedMemberDto>> GetBlockedMembersAsync(string sourceMemberId)
        // {
        //     // return await context.Blocks
        //     //     .Where(b => b.SourceMemberId == sourceMemberId)
        //     //     .Select( b => new BlockedMemberDto
        //     //     {
        //     //         Id = b.TargetMemberId,
        //     //         DisplayName = b.TargetMember.DisplayName,
        //     //         PhotoUrl = b.TargetMember.ImageUrl,
        //     //         Reason = b.Reason,
        //     //         DateBlocked = b.DateBlocked
        //     //     })
        //     //     .ToListAsync();
        // }

        public void RemoveBlock(BlockMember block)
        {
                       
            context.Blocks.Remove(block);
        }

        void IBlockRepository.AddBlock(BlockMember block)
        {
           context.Blocks.Add(block);
        }

       
    }
}