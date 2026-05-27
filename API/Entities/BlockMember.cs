using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class BlockMember
    {
        public string SourceMemberId { get; set; } = null!;
        public AppUser SourceMember { get; set; } = null!;

        public string TargetMemberId { get; set; } = null!;
        public AppUser TargetMember { get; set; } = null!;

        // must be required !!!
        public string? Reason { get; set; }
        public DateTime DateBlocked { get; set; } = DateTime.UtcNow;
    }
}