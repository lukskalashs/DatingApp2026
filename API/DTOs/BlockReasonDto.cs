using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class BlockReasonDto
    {
        [Required]
        [StringLength(200, MinimumLength = 1,  ErrorMessage = "Reason must be between 1 and 200 characters")]
        public required string Reason { get; set; }
    }
}