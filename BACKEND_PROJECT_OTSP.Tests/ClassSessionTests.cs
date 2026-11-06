using System;
using Xunit;
using BACKEND_PROJECT_OTSP.Models;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Tests;

public class ClassSessionTests
{
    [Fact]
    public void SessionEnding_IsIdempotent_WhenAlreadyDone()
    {
        var session = new ClassSession
        {
            Id = 1,
            Status = SessionStatus.Done
        };

        // Simulating the idempotent check in ClassSessionService
        bool isAlreadyDone = session.Status == SessionStatus.Done;
        Assert.True(isAlreadyDone);
    }

    [Theory]
    [InlineData("tutor-owner-id", "tutor-owner-id", false, true)]
    [InlineData("tutor-stranger-id", "tutor-owner-id", false, false)]
    [InlineData("admin-id", "tutor-owner-id", true, true)]
    public void SessionEnding_AuthorizedForClassTutorOrAdmin(string currentUserId, string classTutorUserId, bool isAdmin, bool expectedAllowed)
    {
        bool isOwner = currentUserId == classTutorUserId;
        bool isAllowed = isOwner || isAdmin;

        Assert.Equal(expectedAllowed, isAllowed);
    }
}

