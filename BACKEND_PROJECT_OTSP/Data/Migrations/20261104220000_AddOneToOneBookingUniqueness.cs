using BACKEND_PROJECT_OTSP.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BACKEND_PROJECT_OTSP.Data.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261104220000_AddOneToOneBookingUniqueness")]
public partial class AddOneToOneBookingUniqueness : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateIndex(
            name: "IX_ConnectionRequests_Student_Subject_Grade_OneToOne_Active",
            table: "ConnectionRequests",
            columns: new[] { "StudentId", "SubjectId", "GradeLevelId" },
            unique: true,
            filter: "\"PreferredType\" = 0 AND (\"Status\" = 0 OR (\"Status\" = 1 AND \"ClassroomId\" IS NULL))");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_ConnectionRequests_Student_Subject_Grade_OneToOne_Active",
            table: "ConnectionRequests");
    }
}
