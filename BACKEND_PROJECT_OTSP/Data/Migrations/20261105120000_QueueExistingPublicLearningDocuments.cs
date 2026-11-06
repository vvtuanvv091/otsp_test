using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace BACKEND_PROJECT_OTSP.Data.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261105120000_QueueExistingPublicLearningDocuments")]
public sealed class QueueExistingPublicLearningDocuments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Existing public documents were auto-approved before moderation existed.
        // Re-queue them so public endpoints hide them until an admin reviews them.
        migrationBuilder.Sql("UPDATE \"LearningDocuments\" SET \"Status\" = 0 WHERE \"Scope\" = 1 AND \"Status\" = 1;");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Intentionally irreversible: restoring Approved would expose documents that
        // may have been rejected after the migration was applied.
    }
}
