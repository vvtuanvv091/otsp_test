using BACKEND_PROJECT_OTSP.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BACKEND_PROJECT_OTSP.Data.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261104213500_AddChatMessageSoftDeleteAndEdit")]
public partial class AddChatMessageSoftDeleteAndEdit : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTime>(
            name: "DeletedAt",
            table: "Messagers",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "EditedAt",
            table: "Messagers",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsDeleted",
            table: "Messagers",
            type: "boolean",
            nullable: false,
            defaultValue: false);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "DeletedAt", table: "Messagers");
        migrationBuilder.DropColumn(name: "EditedAt", table: "Messagers");
        migrationBuilder.DropColumn(name: "IsDeleted", table: "Messagers");
    }
}
