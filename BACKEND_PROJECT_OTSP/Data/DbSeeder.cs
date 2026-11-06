using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using BACKEND_PROJECT_OTSP.Models;
using BACKEND_PROJECT_OTSP.Services;
using static BACKEND_PROJECT_OTSP.Models.Enums;

namespace BACKEND_PROJECT_OTSP.Data;

/// <summary>
/// Quản lý việc nạp dữ liệu mẫu và dữ liệu khởi tạo ban đầu cho hệ thống.
/// - SeedCoreDataAsync: Dữ liệu tối thiểu (Vai trò, Danh mục cơ bản, các tài khoản Admin, Tutor, Student mặc định).
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services, bool? forceBulk = null)
    {
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");
        var db = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();

        await SeedCoreDataAsync(db, userManager, roleManager, logger);
        await CleanUpPhantomSessionsAsync(db, logger);
        await SeedTutorClassroomsAndSessionsAsync(db, logger);
        await SeedDefaultNewsArticlesAsync(db, logger);
        await FixLocalUploadUrlsToCloudinaryAsync(db, services, logger);
    }

    private static async Task SeedCoreDataAsync(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger logger)
    {
        // 1. Vai trò cơ bản
        var roleNames = new[] { "Admin", "Tutor", "Student_Parent" };
        var existingRoleNames = await roleManager.Roles
            .Where(r => r.Name != null && roleNames.Contains(r.Name))
            .Select(r => r.Name!)
            .ToListAsync();
        foreach (var ten in roleNames.Except(existingRoleNames))
        {
            await roleManager.CreateAsync(new ApplicationRole { Name = ten });
        }

        // 2. Danh mục môn học cơ bản
        var monHoc = new[]
        {
            (Code: "TOAN", Name: "Toán"),
            (Code: "TIENGANH", Name: "Tiếng Anh")
        };
        var subjectCodes = monHoc.Select(m => m.Code).ToArray();
        var existingSubjectCodes = await db.Subjects
            .Where(s => subjectCodes.Contains(s.Code))
            .Select(s => s.Code)
            .ToListAsync();
        foreach (var m in monHoc.Where(m => !existingSubjectCodes.Contains(m.Code)))
        {
            db.Subjects.Add(new Subject { Code = m.Code, Name = m.Name });
        }

        // 3. Danh mục cấp học cơ bản
        var capHoc = new[]
        {
            (Code: "TH", Name: "Tiểu học"),
            (Code: "THCS", Name: "Trung học cơ sở"),
            (Code: "THPT", Name: "Trung học phổ thông")
        };
        var gradeLevelCodes = capHoc.Select(c => c.Code).ToArray();
        var existingGradeLevelCodes = await db.GradeLevels
            .Where(g => gradeLevelCodes.Contains(g.Code))
            .Select(g => g.Code)
            .ToListAsync();
        foreach (var c in capHoc.Where(c => !existingGradeLevelCodes.Contains(c.Code)))
        {
            db.GradeLevels.Add(new GradeLevel { Code = c.Code, Name = c.Name });
        }
        await db.SaveChangesAsync();

        // 4. Batch kiểm tra các tài khoản cốt lõi (Admin, Tutor, Student mặc định)
        var adminAccounts = new[]
        {
            new { Email = "admin@otsp.com", Password = "Ngoctuan123@", FullName = "Quản trị viên OTSP", Rank = "Quản trị cấp cao" },
            new { Email = "admin@otsp.local", Password = "Admin@12345", FullName = "Quản trị viên hệ thống", Rank = "Quản trị cấp cao" }
        };
        const string tutorEmail = "tutor1@otsp.local";
        const string studentEmail = "hocvien1@otsp.local";
        const string adminAvatar = "https://res.cloudinary.com/dodglt55b/image/upload/v1793847115/otsp/avatars/b72bzktmq1rs8trlfvlf.jpg";
        const string tutorAvatar = "";
        const string studentAvatar = "";

        var coreEmails = adminAccounts.Select(a => a.Email).Concat(new[] { tutorEmail, studentEmail }).ToArray();

        var existingCoreUsers = await userManager.Users
            .Where(u => u.Email != null && coreEmails.Contains(u.Email))
            .ToDictionaryAsync(u => u.Email!, StringComparer.OrdinalIgnoreCase);

        // 4.1. Admin mặc định & các tài khoản quản trị viên
        foreach (var adm in adminAccounts)
        {
            if (!existingCoreUsers.TryGetValue(adm.Email, out var admin))
            {
                admin = new ApplicationUser
                {
                    UserName = adm.Email,
                    Email = adm.Email,
                    EmailConfirmed = true,
                    FullName = adm.FullName,
                    AvatarUrl = adminAvatar
                };
                var kq = await userManager.CreateAsync(admin, adm.Password);
                if (kq.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                    db.AdminProfiles.Add(new AdminProfile { UserId = admin.Id, Rank = adm.Rank });
                    await db.SaveChangesAsync();
                    logger.LogInformation("[DbSeeder] Đã khởi tạo tài khoản Admin: {Email}", adm.Email);
                }
                else
                {
                    logger.LogError("[DbSeeder] Không thể tạo tài khoản Admin {Email}: {Errors}", adm.Email,
                        string.Join("; ", kq.Errors.Select(error => error.Description)));
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(admin.AvatarUrl))
                {
                    admin.AvatarUrl = adminAvatar;
                    await userManager.UpdateAsync(admin);
                }

                if (!await userManager.IsInRoleAsync(admin, "Admin"))
                    await userManager.AddToRoleAsync(admin, "Admin");

                if (!await userManager.CheckPasswordAsync(admin, adm.Password))
                {
                    var resetToken = await userManager.GeneratePasswordResetTokenAsync(admin);
                    var resetResult = await userManager.ResetPasswordAsync(admin, resetToken, adm.Password);
                    if (resetResult.Succeeded)
                        logger.LogInformation("[DbSeeder] Đã đồng bộ mật khẩu bootstrap cho tài khoản Admin {Email}", adm.Email);
                    else
                        logger.LogError("[DbSeeder] Không thể đồng bộ mật khẩu Admin {Email}: {Errors}", adm.Email,
                            string.Join("; ", resetResult.Errors.Select(error => error.Description)));
                }

                if (!await db.AdminProfiles.AnyAsync(profile => profile.UserId == admin.Id))
                {
                    db.AdminProfiles.Add(new AdminProfile { UserId = admin.Id, Rank = adm.Rank });
                    await db.SaveChangesAsync();
                }
            }
        }

        // 4.2. Gia sư mẫu mặc định (Toán THCS)
        if (!existingCoreUsers.TryGetValue(tutorEmail, out var tutorUser))
        {
            tutorUser = new ApplicationUser
            {
                UserName = tutorEmail,
                Email = tutorEmail,
                EmailConfirmed = true,
                FullName = "Nguyễn Văn Gia Sư",
                AvatarUrl = tutorAvatar,
                DateOfBirth = new DateOnly(1995, 5, 10)
            };
            var kq = await userManager.CreateAsync(tutorUser, "Tutor@12345");
            if (kq.Succeeded)
            {
                await userManager.AddToRoleAsync(tutorUser, "Tutor");

                var tutor = new TutorProfile
                {
                    UserId = tutorUser.Id,
                    Introduction = "Giáo viên Toán 5 năm kinh nghiệm luyện thi THCS",
                    HourlyFee = 150000,
                    VerificationStatus = VerificationStatus.Approved,
                    AverageRating = 4.8
                };
                db.TutorProfiles.Add(tutor);
                await db.SaveChangesAsync();

                var toan = await db.Subjects.FirstAsync(s => s.Code == "TOAN");
                var thcs = await db.GradeLevels.FirstAsync(g => g.Code == "THCS");
                db.TutorSubjects.Add(new TutorSubject
                {
                    TutorId = tutor.Id,
                    SubjectId = toan.Id,
                    GradeLevelId = thcs.Id
                });
                await db.SaveChangesAsync();
                logger.LogInformation("[DbSeeder] Đã khởi tạo tài khoản Gia sư mặc định: {Email}", tutorEmail);
            }
        }
        else if (tutorUser.AvatarUrl != tutorAvatar && string.IsNullOrWhiteSpace(tutorUser.AvatarUrl))
        {
            tutorUser.AvatarUrl = tutorAvatar;
            await userManager.UpdateAsync(tutorUser);
        }

        // 4.3. Học viên mẫu mặc định
        if (!existingCoreUsers.TryGetValue(studentEmail, out var studentUser))
        {
            studentUser = new ApplicationUser
            {
                UserName = studentEmail,
                Email = studentEmail,
                EmailConfirmed = true,
                FullName = "Trần Thị Học Viên",
                AvatarUrl = studentAvatar,
                DateOfBirth = new DateOnly(2010, 3, 15)
            };
            var kq = await userManager.CreateAsync(studentUser, "Student@12345");
            if (kq.Succeeded)
            {
                await userManager.AddToRoleAsync(studentUser, "Student_Parent");

                var student = new StudentProfile
                {
                    UserId = studentUser.Id,
                    Area = "Biên Hòa",
                    FreeSchedule = "Thứ 3, Thứ 5 buổi tối"
                };
                db.StudentProfiles.Add(student);
                await db.SaveChangesAsync();

                db.Guardians.Add(new Guardian
                {
                    FullName = "Trần Văn Phụ Huynh",
                    ContactInfo = "0900000000",
                    StudentProfileId = student.Id
                });
                await db.SaveChangesAsync();
                logger.LogInformation("[DbSeeder] Đã khởi tạo tài khoản Học viên mặc định: {Email}", studentEmail);
            }
        }
        else if (studentUser.AvatarUrl != studentAvatar && string.IsNullOrWhiteSpace(studentUser.AvatarUrl))
        {
            studentUser.AvatarUrl = studentAvatar;
            await userManager.UpdateAsync(studentUser);
        }
    }

    private static async Task CleanUpPhantomSessionsAsync(ApplicationDbContext db, ILogger logger)
    {
        try
        {
            logger.LogInformation("[DbSeeder] Bắt đầu CleanUpPhantomSessionsAsync...");

            // 0. Xóa toàn bộ lớp học mẫu tĩnh từng được seed tự động ("Toán 9 - Luyện thi vào lớp 10", "Toán 8 - Nâng cao & Bồi dưỡng HSG")
            var seededSampleNames = new[]
            {
                "Toán 9 - Luyện thi vào lớp 10",
                "Toán 8 - Nâng cao & Bồi dưỡng HSG"
            };
            var sampleClassrooms = await db.Classrooms
                .Where(c => seededSampleNames.Contains(c.Name))
                .ToListAsync();

            if (sampleClassrooms.Any())
            {
                var sampleClassIds = sampleClassrooms.Select(c => c.Id).ToList();
                var sampleSessions = await db.ClassSessions
                    .Where(s => sampleClassIds.Contains(s.ClassroomId))
                    .ToListAsync();

                if (sampleSessions.Any())
                {
                    var sampleSessionIds = sampleSessions.Select(s => s.Id).ToList();
                    var sampleReviews = await db.Reviews.Where(r => sampleSessionIds.Contains(r.ClassSessionId)).ToListAsync();
                    if (sampleReviews.Any())
                    {
                        var sampleReviewIds = sampleReviews.Select(r => r.Id).ToList();
                        var sampleAlerts = await db.ReviewAlerts.Where(ra => sampleReviewIds.Contains(ra.ReviewId)).ToListAsync();
                        if (sampleAlerts.Any()) db.ReviewAlerts.RemoveRange(sampleAlerts);
                        db.Reviews.RemoveRange(sampleReviews);
                    }

                    var sampleAttendances = await db.ClassSessionAttendances
                        .Where(a => sampleSessionIds.Contains(a.ClassSessionId))
                        .ToListAsync();
                    if (sampleAttendances.Any()) db.ClassSessionAttendances.RemoveRange(sampleAttendances);

                    var sampleTrials = await db.TrialSchedules
                        .Where(t => t.ClassSessionId != null && sampleSessionIds.Contains(t.ClassSessionId.Value))
                        .ToListAsync();
                    foreach (var t in sampleTrials) t.ClassSessionId = null;

                    db.ClassSessions.RemoveRange(sampleSessions);
                }

                var sampleWeekly = await db.ClassroomWeeklySchedules
                    .Where(w => sampleClassIds.Contains(w.ClassroomId))
                    .ToListAsync();
                if (sampleWeekly.Any()) db.ClassroomWeeklySchedules.RemoveRange(sampleWeekly);

                var sampleEnrollments = await db.ClassroomStudents
                    .Where(cs => sampleClassIds.Contains(cs.ClassroomId))
                    .ToListAsync();
                if (sampleEnrollments.Any()) db.ClassroomStudents.RemoveRange(sampleEnrollments);

                var samplePayments = await db.Payments
                    .Where(p => sampleClassIds.Contains(p.ClassroomId))
                    .ToListAsync();
                if (samplePayments.Any()) db.Payments.RemoveRange(samplePayments);

                var sampleRequests = await db.ConnectionRequests
                    .Where(cr => cr.ClassroomId != null && sampleClassIds.Contains(cr.ClassroomId.Value))
                    .ToListAsync();
                foreach (var cr in sampleRequests) cr.ClassroomId = null;

                db.Classrooms.RemoveRange(sampleClassrooms);
                await db.SaveChangesAsync();
                logger.LogInformation("[DbSeeder] ĐÃ XÓA {Count} lớp học mẫu tĩnh và các buổi học mẫu đi kèm khỏi Neon DB.", sampleClassrooms.Count);
            }

            // 1. Cập nhật ngày bắt đầu đúng cho lớp học nhóm T.A_1_1 (id 9) là 05/11/2026
            var ta11 = await db.Classrooms.FirstOrDefaultAsync(c => c.Id == 9 || c.Name.Contains("T.A"));
            if (ta11 != null && ta11.StartDate != new DateOnly(2026, 11, 5))
            {
                ta11.StartDate = new DateOnly(2026, 11, 5);
                await db.SaveChangesAsync();
                logger.LogInformation("[DbSeeder] Đã cập nhật StartDate lớp {ClassName} thành 2026-11-05", ta11.Name);
            }

            // 2. Xóa các buổi học ảo được sinh trước ngày bắt đầu StartDate của lớp
            var classrooms = await db.Classrooms
                .Include(c => c.ClassSessions)
                .Where(c => c.StartDate != null)
                .ToListAsync();

            logger.LogInformation("[DbSeeder] CleanUp: Đã tải {Count} lớp có StartDate", classrooms.Count);

            var sessionsToDelete = new List<ClassSession>();
            foreach (var c in classrooms)
            {
                var startDateUtc = DateTime.SpecifyKind(c.StartDate!.Value.ToDateTime(TimeOnly.MinValue).AddHours(-7), DateTimeKind.Utc);
                var phantoms = c.ClassSessions.Where(s => s.ScheduledAt < startDateUtc).ToList();
                logger.LogInformation("[DbSeeder] Lớp #{Id} '{Name}': StartDate={Date}, Tổng sessions={Total}, Phantoms={Phantoms}",
                    c.Id, c.Name, c.StartDate, c.ClassSessions.Count, phantoms.Count);
                sessionsToDelete.AddRange(phantoms);
            }

            if (sessionsToDelete.Any())
            {
                var ids = sessionsToDelete.Select(s => s.Id).ToList();

                // 2.1 Xóa reviews và review alerts
                var reviews = await db.Reviews.Where(r => ids.Contains(r.ClassSessionId)).ToListAsync();
                if (reviews.Any())
                {
                    var reviewIds = reviews.Select(r => r.Id).ToList();
                    var alerts = await db.ReviewAlerts.Where(ra => reviewIds.Contains(ra.ReviewId)).ToListAsync();
                    if (alerts.Any()) db.ReviewAlerts.RemoveRange(alerts);
                    db.Reviews.RemoveRange(reviews);
                }

                // 2.2 Xóa attendances
                var attendances = await db.ClassSessionAttendances.Where(a => ids.Contains(a.ClassSessionId)).ToListAsync();
                if (attendances.Any()) db.ClassSessionAttendances.RemoveRange(attendances);

                // 2.3 Bỏ liên kết trial schedules
                var trials = await db.TrialSchedules.Where(t => t.ClassSessionId != null && ids.Contains(t.ClassSessionId.Value)).ToListAsync();
                foreach (var t in trials) t.ClassSessionId = null;

                db.ClassSessions.RemoveRange(sessionsToDelete);
                await db.SaveChangesAsync();
                logger.LogInformation("[DbSeeder] ĐÃ XÓA {Count} buổi học ảo sinh trước ngày bắt đầu StartDate của các lớp.", sessionsToDelete.Count);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[DbSeeder] Lỗi khi dọn dẹp buổi học ảo: {Message}", ex.Message);
        }
    }

    private static async Task SeedTutorClassroomsAndSessionsAsync(ApplicationDbContext db, ILogger logger)
    {
        var activeClasses = await db.Classrooms
            .Include(c => c.WeeklySchedules)
            .Where(c => c.Status == ClassroomStatus.Active && c.WeeklySchedules.Any())
            .ToListAsync();

        if (!activeClasses.Any()) return;

        // Current week reference in Vietnam time
        var nowVn = DateTime.UtcNow.AddHours(7);
        var todayVn = DateOnly.FromDateTime(nowVn);
        var diff = ((int)todayVn.DayOfWeek + 6) % 7;
        var currentMonday = todayVn.AddDays(-diff);

        foreach (var classroom in activeClasses)
        {
            for (int week = 0; week <= 2; week++)
            {
                var weekMonday = currentMonday.AddDays(week * 7);
                for (int dayOffset = 0; dayOffset < 7; dayOffset++)
                {
                    var targetDate = weekMonday.AddDays(dayOffset);
                    if (classroom.StartDate.HasValue && targetDate < classroom.StartDate.Value)
                        continue;
                    if (targetDate < todayVn)
                        continue;

                    var matchingSchedules = classroom.WeeklySchedules.Where(ws => ws.DayOfWeek == targetDate.DayOfWeek).ToList();

                    foreach (var sched in matchingSchedules)
                    {
                        var sessionVn = targetDate.ToDateTime(sched.StartTime);
                        var sessionUtc = DateTime.SpecifyKind(sessionVn.AddHours(-7), DateTimeKind.Utc);
                        var windowStart = sessionUtc.AddMinutes(-30);
                        var windowEnd = sessionUtc.AddMinutes(30);

                        var exists = await db.ClassSessions.AnyAsync(cs =>
                            cs.ClassroomId == classroom.Id && cs.ScheduledAt >= windowStart && cs.ScheduledAt <= windowEnd);

                        if (!exists)
                        {
                            db.ClassSessions.Add(new ClassSession
                            {
                                ClassroomId = classroom.Id,
                                ScheduledAt = sessionUtc,
                                Status = SessionStatus.Scheduled,
                                VideoRoom = $"OTSP-Room-{classroom.Id}-{Guid.NewGuid():N}"[..26]
                            });
                        }
                    }
                }
            }
        }

        await db.SaveChangesAsync();
        logger.LogInformation("[DbSeeder] Đã đồng bộ buổi học từ lịch cố định cho các lớp thật đang hoạt động.");
    }

    private static async Task SeedDefaultNewsArticlesAsync(ApplicationDbContext db, ILogger logger)
    {
        var admin = await db.AdminProfiles.FirstOrDefaultAsync();
        if (admin == null) return;

        var existingTitles = await db.NewsArticles
            .Select(n => n.Title)
            .ToListAsync();

        var defaultArticles = new (string Category, string Title, string Content, DateTime PublishedAt)[]
        {
            (
                "Tuyển sinh",
                "Hà Nội công bố lịch thi tuyển sinh vào lớp 10 năm học 2027–2028",
                "Sở Giáo dục và Đào tạo vừa công bố kế hoạch tuyển sinh vào lớp 10 THPT công lập năm học 2027–2028, thí sinh và phụ huynh cần lưu ý các mốc đăng ký nguyện vọng và cấu trúc đề thi đổi mới.\n\n" +
                "1. Các mốc thời gian quan trọng cần ghi nhớ:\n" +
                "- Từ đầu tháng 4: Học sinh lớp 9 nộp phiếu đăng ký dự tuyển tại trường THCS đang theo học.\n" +
                "- Giữa tháng 5: Công bố tỷ lệ chọi của từng trường THPT để học sinh cân nhắc điều chỉnh nguyện vọng (nếu nằm trong diện được phép).\n" +
                "- Tuần đầu tháng 6: Tổ chức kỳ thi chính thức với 3 môn Toán, Ngữ văn và Ngoại ngữ.\n\n" +
                "2. Cấu trúc đề thi theo Chương trình Giáo dục phổ thông 2018:\n" +
                "Đề thi năm nay tập trung đánh giá năng lực vận dụng thực tiễn, giảm các câu hỏi học thuộc lòng máy móc. Môn Toán tăng cường các bài toán thực tế và hình học không gian; môn Tiếng Anh kiểm tra toàn diện ngữ âm, từ vựng và kỹ năng đọc hiểu học thuật.\n\n" +
                "3. Lời khuyên từ đội ngũ gia sư OTSP:\n" +
                "Phụ huynh nên cùng con xây dựng lộ trình ôn tập từ sớm, kết hợp học bổ trợ 1-1 hoặc nhóm nhỏ (3-5 học viên) để lấp lỗ hổng kiến thức nền tảng và rèn tâm lý phòng thi vững vàng.",
                new DateTime(2026, 9, 28, 8, 0, 0, DateTimeKind.Utc)
            ),
            (
                "Kinh nghiệm chọn gia sư",
                "Mẹo chọn gia sư phù hợp cho con lớp 9",
                "Giai đoạn lớp 9 là bước ngoặt quan trọng chuẩn bị cho kỳ thi chuyển cấp. Việc chọn đúng gia sư đồng hành không chỉ giúp học sinh cải thiện điểm số mà còn tạo hứng thú học tập lâu dài.\n\n" +
                "1. Xác định rõ mục tiêu học tập của con:\n" +
                "Trước khi tìm gia sư, phụ huynh cần trao đổi thẳng thắn với con để biết con đang mất gốc kiến thức cơ bản, cần hệ thống hóa chuyên đề hay muốn luyện đề nâng cao vào trường chuyên, lớp chọn.\n\n" +
                "2. Kiểm tra hồ sơ và văn bằng minh bạch:\n" +
                "Tại nền tảng OTSP, 100% gia sư đều được đối soát CCCD, thẻ sinh viên/bằng tốt nghiệp và chứng chỉ chuyên môn (IELTS, giải thưởng học sinh giỏi) trước khi mở lớp.\n\n" +
                "3. Tận dụng buổi học thử đánh giá mức độ tương tác:\n" +
                "Một gia sư giỏi chuyên môn cần có phương pháp truyền đạt phù hợp với tính cách của học sinh. Qua buổi học thử trực tuyến trên OTSP, phụ huynh có thể quan sát cách gia sư đặt câu hỏi gợi mở và lộ trình cá nhân hóa cho từng tuần.",
                new DateTime(2026, 9, 27, 8, 0, 0, DateTimeKind.Utc)
            ),
            (
                "Phương pháp học",
                "5 phương pháp ôn thi hiệu quả trong 3 tháng cuối",
                "Ba tháng nước rút trước kỳ thi là giai đoạn quyết định để bứt phá điểm số. Thay vì học dồn ép gây quá tải, học sinh có thể áp dụng 5 phương pháp khoa học sau đây:\n\n" +
                "1. Phương pháp Active Recall (Chủ động gợi nhớ):\n" +
                "Sau khi học xong mỗi chuyên đề, hãy gấp sách lại và tự tóm tắt các công thức, định lý hoặc sơ đồ tư duy ra giấy trắng thay vì chỉ đọc lại thụ động.\n\n" +
                "2. Kỹ thuật Spaced Repetition (Lặp lại ngắt quãng):\n" +
                "Ôn lại kiến thức theo chu kỳ 1 ngày - 3 ngày - 7 ngày - 14 ngày để chuyển thông tin từ trí nhớ ngắn hạn sang trí nhớ dài hạn.\n\n" +
                "3. Chia nhỏ thời gian theo Pomodoro (50 phút học - 10 phút nghỉ):\n" +
                "Giúp não bộ duy trì sự tập trung cao độ mà không bị kiệt sức khi giải các đề thi tổng hợp.\n\n" +
                "4. Sổ tay lỗi sai (Mistake Notebook):\n" +
                "Ghi chép lại toàn bộ các câu làm sai khi luyện đề, phân tích nguyên nhân sai (do nhầm công thức, đọc thiếu dữ kiện hay tính toán ẩu) để không lặp lại trong phòng thi.\n\n" +
                "5. Luyện đề bấm giờ thực chiến cùng gia sư:\n" +
                "Mỗi tuần thực hiện 1-2 đề thi chuẩn cấu trúc dưới sự bấm giờ và chấm chữa chi tiết của gia sư OTSP để rèn kỹ năng phân bổ thời gian.",
                new DateTime(2026, 9, 25, 8, 0, 0, DateTimeKind.Utc)
            ),
            (
                "Xu hướng giáo dục",
                "Học online hay offline: đâu là lựa chọn tối ưu?",
                "Sự phát triển của công nghệ phòng học trực tuyến tương tác đã làm thay đổi hoàn toàn cách tiếp cận việc học kèm. Vậy học viên nên chọn học online 1-1 hay học trực tiếp truyền thống?\n\n" +
                "1. Ưu điểm vượt trội của học trực tuyến trên OTSP:\n" +
                "- Tiết kiệm 100% thời gian di chuyển, đặc biệt an toàn vào buổi tối hoặc mùa mưa bão.\n" +
                "- Tiếp cận đội ngũ gia sư giỏi trên toàn quốc thay vì bị giới hạn trong phạm vi vài km quanh nhà.\n" +
                "- Tích hợp phòng học Video HD (Jitsi Meet), chia sẻ màn hình, bảng trắng điện tử và kho tài liệu PDF lưu trữ trọn đời.\n\n" +
                "2. Khi nào nên kết hợp học nhóm nhỏ?\n" +
                "Các lớp nhóm từ 3-5 học viên trên OTSP giúp tăng tính thi đua, thảo luận sôi nổi với mức học phí tiết kiệm hơn 40% so với học kèm riêng nhưng vẫn đảm bảo gia sư theo sát từng em.",
                new DateTime(2026, 9, 22, 8, 0, 0, DateTimeKind.Utc)
            ),
            (
                "Thông báo OTSP",
                "OTSP cập nhật tính năng kết nối gia sư theo lịch rảnh và phòng học trực tuyến",
                "Nhằm mang lại trải nghiệm học tập thuận tiện và minh bạch nhất cho phụ huynh, học viên và gia sư, đội ngũ phát triển OTSP chính thức cập nhật loạt tính năng mới trên hệ thống:\n\n" +
                "1. Ma trận lịch rảnh thông minh theo tuần:\n" +
                "Học viên có thể xem trực tiếp các khung giờ trống của gia sư (Sáng - Chiều - Tối từ Thứ 2 đến Chủ Nhật) để đặt lịch học thử hoặc đăng ký lớp chỉ với vài thao tác.\n\n" +
                "2. Phòng học Video tích hợp kiểm soát quyền riêng tư:\n" +
                "Khi tham gia buổi học, hệ thống hỗ trợ màn hình kiểm tra thiết bị (Pre-join) và mặc định tắt Camera/Micro cho đến khi người học chủ động bật, đồng thời chống mở trùng tab gây vang âm thanh.\n\n" +
                "3. Đối soát học phí tự động qua VietQR / SePay:\n" +
                "Mọi giao dịch thanh toán học phí đều được xác nhận tức thì 24/7 và thống kê minh bạch trong bảng điều khiển của cả học viên lẫn gia sư.",
                new DateTime(2026, 9, 20, 8, 0, 0, DateTimeKind.Utc)
            )
        };

        int added = 0;
        foreach (var item in defaultArticles)
        {
            if (!existingTitles.Any(t => string.Equals(t, item.Title, StringComparison.OrdinalIgnoreCase)))
            {
                db.NewsArticles.Add(new NewsArticle
                {
                    AdminId = admin.Id,
                    Category = item.Category,
                    Title = item.Title,
                    Content = item.Content,
                    PublishedAt = item.PublishedAt
                });
                added++;
            }
        }

        if (added > 0)
        {
            await db.SaveChangesAsync();
            logger.LogInformation("[DbSeeder] Đã khởi tạo bổ sung {Count} bài viết tin tức mẫu.", added);
        }
    }

    private static async Task FixLocalUploadUrlsToCloudinaryAsync(ApplicationDbContext db, IServiceProvider services, ILogger logger)
    {
        var mappings = new (string Key, string Url, string? PublicId)[]
        {
            ("b77359a832e54e9a8fc2dd1b07f6bc77", "https://res.cloudinary.com/dodglt55b/image/upload/v1793847115/otsp/avatars/b72bzktmq1rs8trlfvlf.jpg", "otsp/avatars/b72bzktmq1rs8trlfvlf"),
            ("8b3f40a10b084481b2d4610990137019", "https://res.cloudinary.com/dodglt55b/image/upload/v1793847114/otsp/avatars/eunwikxq3e3m956vbz3b.png", "otsp/avatars/eunwikxq3e3m956vbz3b"),
            ("c450d9b08fe24001b824c361d03042b3", "https://res.cloudinary.com/dodglt55b/image/upload/v1793847155/otsp/classrooms/p4gp4hb1fuhtmlazehjf.webp", "otsp/classrooms/p4gp4hb1fuhtmlazehjf"),
            ("c0fb234aa71444c7bb025eb42f2d0fcd", "https://res.cloudinary.com/dodglt55b/image/upload/v1793847153/otsp/classrooms/wypdzjibdpbdtv1kuvpb.png", "otsp/classrooms/wypdzjibdpbdtv1kuvpb"),
            ("70c53ee4b85f45969199beca6c0b66cb", "https://res.cloudinary.com/dodglt55b/image/upload/v1793847157/otsp/qualifications/zwc4rgznhc5wou5poezw.png", null),
            ("4cd8f956c56444a1a00444460ee75a5f", "https://res.cloudinary.com/dodglt55b/image/upload/v1793847128/otsp/chat/mhdt3wxqqqidunjup0lz.webp", null),
            ("dd4e8f4d69a54c6bbecdf7f598d0e231", "https://res.cloudinary.com/dodglt55b/image/upload/v1793847130/otsp/chat/pv5vhxfdhekm0eikhctd.webp", null),
            ("e7e240db1aa84e97a9a9878b514d61b8", "https://res.cloudinary.com/dodglt55b/image/upload/v1793847144/otsp/chat/i9dnd4qaudnfqegwdjbr.webp", null)
        };

        var users = await db.Users.Where(u => u.AvatarUrl != null && u.AvatarUrl.Contains("/uploads/")).ToListAsync();
        foreach (var u in users)
        {
            foreach (var m in mappings)
            {
                if (u.AvatarUrl!.Contains(m.Key))
                {
                    u.AvatarUrl = m.Url;
                    break;
                }
            }
        }

        var classrooms = await db.Classrooms.Where(c => c.CoverImageUrl != null && c.CoverImageUrl.Contains("/uploads/")).ToListAsync();
        foreach (var c in classrooms)
        {
            foreach (var m in mappings)
            {
                if (c.CoverImageUrl!.Contains(m.Key))
                {
                    c.CoverImageUrl = m.Url;
                    if (m.PublicId != null) c.CoverImagePublicId = m.PublicId;
                    break;
                }
            }
        }

        var imageStorage = services.GetService<IImageStorageService>();
        var env = services.GetService<IWebHostEnvironment>();
        var quals = await db.Qualifications.Where(q => q.FileUrl != null && !q.FileUrl.StartsWith("http")).ToListAsync();
        foreach (var q in quals)
        {
            var matched = false;
            foreach (var m in mappings)
            {
                if (q.FileUrl!.Contains(m.Key))
                {
                    q.FileUrl = m.Url;
                    matched = true;
                    break;
                }
            }

            if (!matched && imageStorage != null && env != null)
            {
                var safeName = Path.GetFileName(q.FileUrl!);
                var localPath = Path.Combine(env.ContentRootPath, "App_Data", "qualifications", safeName);
                if (File.Exists(localPath))
                {
                    var uploaded = await imageStorage.UploadLocalFileAsync(localPath, "otsp/qualifications", CancellationToken.None);
                    if (uploaded != null && !string.IsNullOrWhiteSpace(uploaded.Url))
                    {
                        q.FileUrl = uploaded.Url;
                        logger.LogInformation("[DbSeeder] Đã tải bằng cấp '{Title}' ({File}) lên Cloudinary: {Url}", q.Title, safeName, uploaded.Url);
                    }
                }
            }
        }

        var msgs = await db.Messagers.Where(msg => msg.Content != null && msg.Content.Contains("/uploads/")).ToListAsync();
        foreach (var msg in msgs)
        {
            foreach (var m in mappings)
            {
                if (msg.Content!.Contains(m.Key))
                {
                    msg.Content = msg.Content.Replace($"/uploads/chat/{m.Key}.webp", m.Url);
                    if (msg.Content.Contains(m.Key))
                    {
                        msg.Content = m.Url;
                    }
                    break;
                }
            }
        }

        await db.SaveChangesAsync();
        logger.LogInformation("[DbSeeder] Đã đồng bộ toàn bộ URL ảnh và bằng cấp sang Cloudinary CDN.");
    }
}
