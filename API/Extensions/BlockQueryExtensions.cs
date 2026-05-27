using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;

namespace API.Extensions
{
    public static class BlockQueryExtensions
    {
         public static IQueryable<Member> ExcludeBlocked(
        this IQueryable<Member> query, AppDbContext context, string viewerId)
    {
        return query.Where(m =>
            !context.Blocks.Any(b =>
                (b.SourceMemberId == viewerId && b.TargetMemberId == m.Id) ||
                (b.TargetMemberId == viewerId && b.SourceMemberId == m.Id)));
    }

    public static IQueryable<Message> ExcludeBlocked(
        this IQueryable<Message> query, AppDbContext context, string viewerId)
    {
        return query.Where(x =>
            !context.Blocks.Any(b =>
                (b.SourceMemberId == viewerId &&
                    (b.TargetMemberId == x.SenderId || b.TargetMemberId == x.RecipientId)) ||
                (b.TargetMemberId == viewerId &&
                    (b.SourceMemberId == x.SenderId || b.SourceMemberId == x.RecipientId))));
    }
    }
}