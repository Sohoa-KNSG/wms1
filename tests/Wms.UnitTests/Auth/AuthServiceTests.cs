using BCrypt.Net;
using Wms.Application.Auth.Models;
using Xunit;

namespace Wms.UnitTests.Auth;

public class AuthServiceTests
{
    [Fact]
    public void BCrypt_HashPassword_And_Verify_ShouldBeConsistent()
    {
        string rawPassword = "SuperSecurePassword123!";
        string hash = BCrypt.Net.BCrypt.HashPassword(rawPassword);

        Assert.NotNull(hash);
        Assert.True(BCrypt.Net.BCrypt.Verify(rawPassword, hash));
        Assert.False(BCrypt.Net.BCrypt.Verify("WrongPassword", hash));
    }

    [Fact]
    public void ChangePasswordRequest_Validation_ShouldDetectMismatch()
    {
        var req = new ChangePasswordRequestDto("Current123!", "NewPass123!", "DifferentPass123!");
        Assert.NotEqual(req.NewPassword, req.ConfirmNewPassword);
    }
}
