using Moq;
using Wms.Api.Controllers;
using Wms.Application.Common.Interfaces;
using Xunit;

namespace Wms.UnitTests.Reports;

public class ReportsContractTests
{
    [Fact]
    public void ReportsController_ShouldBeDecoratedWithReportsReadPolicy()
    {
        var type = typeof(ReportsController);
        var authorizeAttrs = type.GetCustomAttributes(typeof(Microsoft.AspNetCore.Authorization.AuthorizeAttribute), true);

        Assert.NotEmpty(authorizeAttrs);
        var authAttr = (Microsoft.AspNetCore.Authorization.AuthorizeAttribute)authorizeAttrs[0];
        Assert.Equal("Reports.Read", authAttr.Policy);
    }
}
