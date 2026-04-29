using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Framework;

namespace API.Controllers
{
    public class BuggyController : BaseApiController
    {
        [HttpGet("auth")]
        public IActionResult getAuth()
        {
            return Unauthorized();
        }
        [HttpGet("not-found")]
        public IActionResult GetNotFound()
        {
            return NotFound();
        }
         [HttpGet("server-error")]
        public IActionResult GetServerError()
        {
            throw new Exception("This is a server error");
        }
         [HttpGet("bad-request")]
        public IActionResult GetBadRequest()
        {
            return BadRequest("This is not a good request");
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("admin-secret")]
        public ActionResult<string> GetSecretAdmin()
        {
            return Ok("Only admins should see this");
        }
    }
}