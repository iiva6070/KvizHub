using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KvizHub.Repository.Migrations
{
    /// <inheritdoc />
    public partial class MakeIvaAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        DELETE FROM Users
        WHERE Role = 'User'
        AND (
            Email = 'iiva6070@gmail.com'
            OR Username = 'Iva'
        );
    ");

            migrationBuilder.Sql(@"
        UPDATE Users
        SET Role = 'Admin'
        WHERE Email = 'iiva6070@gmail.com'
        OR Username = 'Iva';
    ");
        }
    }
}