using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Wms.Api.Controllers;
using Wms.Domain.Constants;
using Xunit;

namespace Wms.UnitTests.Security;

public class ControllerAuthorizationTests
{
    [Theory]
    [InlineData(nameof(ReceiptController.ScanBarcode), PolicyNames.ReceiptScan)]
    [InlineData(nameof(ReceiptController.ScanThung60), PolicyNames.ReceiptScan)]
    [InlineData(nameof(ReceiptController.OfficialConfirm), PolicyNames.ReceiptConfirm)]
    [InlineData(nameof(ReceiptController.ConfirmNhapKho), PolicyNames.ReceiptConfirm)]
    [InlineData(nameof(ReceiptController.ConfirmNhapLe), PolicyNames.ReceiptConfirm)]
    [InlineData(nameof(ReceiptController.ConfirmNhapLeBatch), PolicyNames.ReceiptConfirm)]
    [InlineData(nameof(ReceiptController.CancelScan), PolicyNames.ReceiptManage)]
    [InlineData(nameof(ReceiptController.CancelHandoverScan), PolicyNames.ReceiptManage)]
    public void ReceiptMutation_ShouldRequireExpectedPolicy(string methodName, string expectedPolicy)
    {
        var method = typeof(ReceiptController).GetMethod(methodName);

        Assert.NotNull(method);
        Assert.Contains(
            method!.GetCustomAttributes<AuthorizeAttribute>(),
            attribute => attribute.Policy == expectedPolicy);
    }

    [Fact]
    public void ClearTestData_ShouldRequireAdministratorPolicy()
    {
        var method = typeof(ExportRequirementsController).GetMethod(
            nameof(ExportRequirementsController.ClearTestData));

        Assert.NotNull(method);
        Assert.Contains(
            method!.GetCustomAttributes<AuthorizeAttribute>(),
            attribute => attribute.Policy == PolicyNames.AdminUsersManage);
        Assert.Empty(method.GetCustomAttributes<AllowAnonymousAttribute>());
    }

    [Fact]
    public void RecordSystemChange_ShouldRequireAdministratorPolicy()
    {
        var method = typeof(SystemMemoryController).GetMethod(
            nameof(SystemMemoryController.RecordChangeHistory));

        Assert.NotNull(method);
        Assert.Contains(
            method!.GetCustomAttributes<AuthorizeAttribute>(),
            attribute => attribute.Policy == PolicyNames.AdminUsersManage);
        Assert.Empty(method.GetCustomAttributes<AllowAnonymousAttribute>());
    }
}
