using Wms.Domain.Constants;
using Xunit;

namespace Wms.UnitTests.Security;

public class AuthorizationPolicyTests
{
    [Fact]
    public void PolicyNames_ShouldContainExpectedConstants()
    {
        Assert.Equal("Receipt.Scan", PolicyNames.ReceiptScan);
        Assert.Equal("Picking.Ship", PolicyNames.PickingShip);
        Assert.Equal("Admin.Users.Manage", PolicyNames.AdminUsersManage);
    }
}
