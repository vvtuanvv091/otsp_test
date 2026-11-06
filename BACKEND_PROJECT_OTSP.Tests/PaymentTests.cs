using System;
using System.Text.RegularExpressions;
using Xunit;

namespace BACKEND_PROJECT_OTSP.Tests;

public class PaymentTests
{
    private static readonly Regex PaymentRegex = new(@"OTSP(\d+)", RegexOptions.IgnoreCase);

    [Theory]
    [InlineData("Thanh toan khoa hoc OTSP123 thanh cong", 123)]
    [InlineData("otsp999 chuyen khoan", 999)]
    [InlineData("MBVCB.12345.OTSP55.hoc phi", 55)]
    public void PaymentRegex_ExtractsValidPaymentId(string content, int expectedId)
    {
        var match = PaymentRegex.Match(content);
        Assert.True(match.Success);
        Assert.Equal(expectedId, int.Parse(match.Groups[1].Value));
    }

    [Theory]
    [InlineData("0984391940 chuyen tien hoc")]
    [InlineData("so dien thoai 0912345678")]
    [InlineData("KHONG CO MA OTSP O DAY")]
    [InlineData("")]
    public void PaymentRegex_RejectsInvalidContent(string content)
    {
        var match = PaymentRegex.Match(content);
        Assert.False(match.Success);
    }

    [Theory]
    [InlineData(1000000, 200000, 800000)]
    [InlineData(250000, 50000, 200000)]
    [InlineData(150000, 30000, 120000)]
    public void PayoutCalculation_CalculatesExactCommissionAndTutorPayout(decimal totalTuition, decimal expectedPlatformFee, decimal expectedTutorPayout)
    {
        const decimal platformFeeRate = 0.20m;
        var platformCommission = Math.Round(totalTuition * platformFeeRate, 0);
        var tutorPayout = totalTuition - platformCommission;

        Assert.Equal(expectedPlatformFee, platformCommission);
        Assert.Equal(expectedTutorPayout, tutorPayout);
    }
}

