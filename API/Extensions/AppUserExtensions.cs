using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace API.Extensions
{
    public static class AppUserExtensions
    {
        public static UserDto ToDTo(this AppUser user, ITokenService tokenService)
        {
            return new UserDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                ImageUrl = user.ImageUrl,
                Token = tokenService.CreateToken(user),
            };
        }
    }
}