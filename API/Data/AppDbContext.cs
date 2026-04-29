using System;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Member> Members { get; set; }
    public DbSet<Photo> Photos { get; set; }

    public DbSet<MemberLike> Likes { get; set; }

    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<IdentityRole>()
            .HasData(
                new IdentityRole{Id = "member-id", ConcurrencyStamp = "a", Name = "Member", NormalizedName = "MEMBER"},
                new IdentityRole{Id = "moderator-id", ConcurrencyStamp = "b", Name = "Moderator", NormalizedName = "MODERATOR"},
                new IdentityRole{Id = "admin-id", ConcurrencyStamp = "c", Name = "Admin", NormalizedName = "ADMIN"}
            );

        modelBuilder.Entity<Message>()
                .HasOne(x => x.Recipient)
                .WithMany(x => x.MessagesReceived)
                .OnDelete(DeleteBehavior.Restrict);

       modelBuilder.Entity<Message>()
            .HasOne(x => x.Sender)
            .WithMany(x => x.MessagesSent)
            .OnDelete(DeleteBehavior.Restrict);

           modelBuilder.Entity<MemberLike>()
            .HasKey(k => new { k.SourceMemberId, k.TargetMemberId });

           modelBuilder.Entity<MemberLike>()
            .HasOne(s => s.SourceMember)
            .WithMany(t => t.LikedMembers)
            .HasForeignKey(s => s.SourceMemberId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MemberLike>()
            .HasOne(s => s.TargetMember)
            .WithMany(t => t.LikedByMembers)
            .HasForeignKey(s => s.TargetMemberId)
            .OnDelete(DeleteBehavior.NoAction);

        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(), // Convert to UTC when saving
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)); // Specify UTC when reading

        var nullabledateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? v.Value.ToUniversalTime() : null, // Convert to UTC when saving
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null
        ); // Specify UTC when reading

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }

                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(nullabledateTimeConverter);
                }
            }
        }
    }
}
