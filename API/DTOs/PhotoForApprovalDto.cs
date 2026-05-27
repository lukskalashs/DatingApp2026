using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class PhotoForApprovalDto
    {
        public int Id { get; set; }
        public required string Url { get; set; }
        public required string MemberId { get; set; }
        public string? DisplayName { get; set; }
        public bool IsApproved { get; set; }
    }
}