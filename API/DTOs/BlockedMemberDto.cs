using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class BlockedMemberDto
    {
        public required string Id { get; set; }
        public required string DisplayName { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Reason { get; set; }
        public DateTime DateBlocked { get; set; }
    }
}