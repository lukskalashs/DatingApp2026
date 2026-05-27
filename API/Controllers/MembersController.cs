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
    [Authorize]
    public class MembersController(IUnitOfWork uow, 
        IPhotoService photoService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers([FromQuery]MemberParams memberParams)
        {
            memberParams.CurrentMemberId = User.GetMemberId();

            return Ok(await uow.MemberRepository.GetMembersAsync(memberParams));
        }
        
        [HttpGet("{id}")] // Localhost:5001/api/members/bob-id
        
        public async Task<ActionResult<Member>> GetMember(string id)
        {
            var member = await uow.MemberRepository.GetMemberByIdAsync(id);
            if(member == null) return NotFound();

            return member;
        }

        [HttpGet("{id}/photos")]
        public async Task<ActionResult<IReadOnlyList<Photo>>> GetMemberPhotos(string id)
        {
            return Ok(await uow.MemberRepository.GetPhotosForMemberAsync(id, User.GetMemberId() == id));
        }
        [HttpPut]
        public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto)
        {
            var memberId = User.GetMemberId();

            if(memberId == null) return BadRequest("Oops - no id found in the token");

            var member = await uow.MemberRepository.GetMemberForUpdate(memberId);

            if(member == null) return BadRequest("Could not get member");

            member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
            member.Country = memberUpdateDto.Country ?? member.Country;
            member.Description = memberUpdateDto.Description ?? member.Description;
            member.City = memberUpdateDto.City ?? member.City;

            member.User.DisplayName = memberUpdateDto.DisplayName ?? member.User.DisplayName;
            


            uow.MemberRepository.Update(member); // Optional

            if(await uow.Complete()) return NoContent();

            return BadRequest("Failed to update member");
        }

        [HttpPost("add-photo")]

        public async Task<ActionResult<Photo>> AddPhoto ([FromForm]IFormFile file)
        {
            var member = await uow.MemberRepository.GetMemberForUpdate(User.GetMemberId());

            if(member == null) return BadRequest("Cannot Update Member");

            var results = await photoService.UploadPhotoAsync(file);

            if(results.Error != null) return BadRequest(results.Error.Message);

            var photo = new Photo
            {
                Url = results.SecureUrl.AbsoluteUri,
                publicId = results.PublicId,
                MemberId = User.GetMemberId()
                // IsApproved will default to false automatically based on the boolean data type
            };

            // if(member.ImageUrl == null)
            // {
            //     member.ImageUrl = photo.Url;
            //     member.User.ImageUrl = photo.Url;

            // }

            member.Photos.Add(photo);

            if(await uow.Complete()) return photo;

            return BadRequest("Problem adding photo");
            
        }
        
        
        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var member = await uow.MemberRepository.GetMemberForUpdate(User.GetMemberId());

            if (member == null) return BadRequest("Cannot gett member from token");

            var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);

            if (member.ImageUrl == photo?.Url || photo == null)
            {
                return BadRequest("Cannot set this as main image");
            }

            if (!photo.IsApproved)
            {
                return BadRequest("Cannot set an unapproved photo as your main photo");
            }

            member.ImageUrl = photo.Url;
            member.User.ImageUrl = photo.Url;

            if (await uow.Complete()) return NoContent();

            return BadRequest("Problem setting main photo");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var member = await uow.MemberRepository.GetMemberForUpdate(User.GetMemberId());

            if (member == null) return BadRequest("Cannot get member from token");

            var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);

            if (photo == null || photo.Url == member.ImageUrl)
            {
                return BadRequest("This photo cannot be deleted");
            }
            
            if (photo.publicId != null)
            {
                var result = await photoService.DeletePhotoAsync(photo.publicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }

            member.Photos.Remove(photo);

            if (await uow.Complete()) return Ok();

            return BadRequest("Problem deleting the photo");
        }



    }



}
