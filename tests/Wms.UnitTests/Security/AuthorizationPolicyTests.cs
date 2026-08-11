using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System.Reflection;
using Wms.Api.Controllers;
using Wms.Domain.Constants;
using Wms.Infrastructure.Services;
using Xunit;

namespace Wms.UnitTests.Security;

public class AuthorizationPolicyTests
{
    [Fact]
    public void PolicyNames_ShouldContainExpectedConstants()
    {
        Assert.Equal("Receipt.Scan", PolicyNames.ReceiptScan);
        Assert.Equal("Picking.Ship", PolicyNames.PickingShip);
        Assert.Equal("StockType.Manage", PolicyNames.StockTypeManage);
        Assert.Equal("Admin.Users.Manage", PolicyNames.AdminUsersManage);
    }

    [Fact]
    public void PermissionResolver_ShouldFailClosedForUnconfiguredNonAdminRole()
    {
        var permissions = PermissionResolver.Resolve(
            new[] { "STOREKEEPER" },
            Array.Empty<string>(),
            new[] { PolicyNames.AdminUsersManage, PolicyNames.ReceiptRead });

        Assert.Empty(permissions);
    }

    [Fact]
    public void PermissionResolver_ShouldGrantAllPoliciesOnlyToAdministrator()
    {
        var allPolicies = new[] { PolicyNames.AdminUsersManage, PolicyNames.ReceiptRead };
        var permissions = PermissionResolver.Resolve(new[] { "IT_ADMIN" }, Array.Empty<string>(), allPolicies);

        Assert.Equal(allPolicies.OrderBy(value => value), permissions.OrderBy(value => value));
    }

    [Theory]
    [InlineData(typeof(ReceiptController), nameof(ReceiptController.ConfirmNhapKho), PolicyNames.ReceiptConfirm)]
    [InlineData(typeof(ReceiptController), nameof(ReceiptController.CancelScan), PolicyNames.ReceiptManage)]
    [InlineData(typeof(PalletController), nameof(PalletController.GetPalletInfo), PolicyNames.PalletRead)]
    [InlineData(typeof(PalletController), nameof(PalletController.InitPallet), PolicyNames.PalletManage)]
    [InlineData(typeof(OemOrdersController), nameof(OemOrdersController.GetOrders), PolicyNames.OemRead)]
    public void CommandAndQueryActions_ShouldRequireExpectedPolicy(Type controller, string methodName, string expectedPolicy)
    {
        var method = controller.GetMethod(methodName);
        Assert.NotNull(method);

        var authorize = method!.GetCustomAttributes(typeof(AuthorizeAttribute), true)
            .Cast<AuthorizeAttribute>()
            .Single();

        Assert.Equal(expectedPolicy, authorize.Policy);
    }

    [Fact]
    public void SystemMemoryController_ShouldRequireDedicatedPolicy()
    {
        var authorize = typeof(SystemMemoryController)
            .GetCustomAttributes(typeof(AuthorizeAttribute), true)
            .Cast<AuthorizeAttribute>()
            .Single();

        Assert.Equal(PolicyNames.SystemMemoryManage, authorize.Policy);
        Assert.Empty(typeof(SystemMemoryController).GetCustomAttributes(typeof(AllowAnonymousAttribute), true));
    }

    [Fact]
    public void EveryControllerAction_ShouldUseAllowAnonymousOrDedicatedPolicy()
    {
        var missingPolicies = typeof(AuthController).Assembly
            .GetTypes()
            .Where(type => !type.IsAbstract && typeof(ControllerBase).IsAssignableFrom(type))
            .SelectMany(type => type
                .GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly)
                .Where(method => method.GetCustomAttributes<HttpMethodAttribute>(true).Any())
                .Select(method => new { Controller = type, Action = method }))
            .Where(endpoint => !endpoint.Action.GetCustomAttributes<AllowAnonymousAttribute>(true).Any())
            .Where(endpoint => endpoint.Action.Name != nameof(AuthController.ChangePassword) || endpoint.Controller != typeof(AuthController))
            .Where(endpoint => !endpoint.Action
                .GetCustomAttributes<AuthorizeAttribute>(true)
                .Concat(endpoint.Controller.GetCustomAttributes<AuthorizeAttribute>(true))
                .Any(authorize => !string.IsNullOrWhiteSpace(authorize.Policy)))
            .Select(endpoint => $"{endpoint.Controller.Name}.{endpoint.Action.Name}")
            .OrderBy(name => name)
            .ToArray();

        Assert.True(
            missingPolicies.Length == 0,
            $"Actions without a dedicated authorization policy: {string.Join(", ", missingPolicies)}");
    }

    [Fact]
    public void ExportController_ShouldNotExposeClearTestDataEndpoint()
    {
        Assert.Null(typeof(ExportRequirementsController).GetMethod("ClearTestData"));
    }
}
