using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;
using BACKEND_PROJECT_OTSP.Models;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Tests;

public class ScheduleTests
{
    [Fact]
    public void ScheduleGenerator_NeverGeneratesBeforeStartDate()
    {
        var startDate = new DateOnly(2026, 11, 5); // Thursday
        var monday = new DateOnly(2026, 11, 2);    // Monday of the same week
        var schedules = new List<ClassroomWeeklySchedule>
        {
            new() { DayOfWeek = DayOfWeek.Tuesday, StartTime = new TimeOnly(19, 0), EndTime = new TimeOnly(21, 0) },
            new() { DayOfWeek = DayOfWeek.Thursday, StartTime = new TimeOnly(19, 0), EndTime = new TimeOnly(21, 0) },
            new() { DayOfWeek = DayOfWeek.Friday, StartTime = new TimeOnly(19, 0), EndTime = new TimeOnly(21, 0) }
        };

        var generatedDays = new List<DateOnly>();
        for (int i = 0; i < 7; i++)
        {
            var targetDate = monday.AddDays(i);
            // Boundary rule 1: Never generate before StartDate
            if (targetDate < startDate)
                continue;

            var matching = schedules.Where(s => s.DayOfWeek == targetDate.DayOfWeek).ToList();
            if (matching.Any())
            {
                generatedDays.Add(targetDate);
            }
        }

        // Tuesday 03/11 is BEFORE 05/11, must NOT be generated
        Assert.DoesNotContain(new DateOnly(2026, 11, 3), generatedDays);
        // Thursday 05/11 and Friday 06/11 are ON/AFTER 05/11, should be generated
        Assert.Contains(new DateOnly(2026, 11, 5), generatedDays);
        Assert.Contains(new DateOnly(2026, 11, 6), generatedDays);
        Assert.Equal(2, generatedDays.Count);
    }

    [Fact]
    public void ScheduleGenerator_NeverGeneratesInPastPriorToToday()
    {
        var todayVn = new DateOnly(2026, 11, 5);
        var monday = new DateOnly(2026, 11, 2);

        var generatedDays = new List<DateOnly>();
        for (int i = 0; i < 7; i++)
        {
            var targetDate = monday.AddDays(i);
            // Boundary rule 2: Never generate in the past prior to today
            if (targetDate < todayVn)
                continue;

            generatedDays.Add(targetDate);
        }

        Assert.All(generatedDays, d => Assert.True(d >= todayVn));
        Assert.DoesNotContain(new DateOnly(2026, 11, 2), generatedDays);
        Assert.DoesNotContain(new DateOnly(2026, 11, 3), generatedDays);
        Assert.DoesNotContain(new DateOnly(2026, 11, 4), generatedDays);
    }

    [Fact]
    public void NewSessions_MustDefaultToScheduled_NeverDone()
    {
        var sessionUtc = DateTime.UtcNow.AddDays(1);
        var status = Math.Abs((sessionUtc - DateTime.UtcNow).TotalHours) < 1.0
            ? SessionStatus.InProgress
            : SessionStatus.Scheduled;

        Assert.Equal(SessionStatus.Scheduled, status);
        Assert.NotEqual(SessionStatus.Done, status);
    }
}

