namespace Wms.Infrastructure.Services;

public static class PermissionResolver
{
    public static IReadOnlyCollection<string> Resolve(
        IEnumerable<string> roles,
        IEnumerable<string> configuredPermissions,
        IEnumerable<string> allPolicies)
    {
        var roleSet = roles.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var permissions = configuredPermissions
            .Where(permission => !string.IsNullOrWhiteSpace(permission))
            .ToHashSet(StringComparer.Ordinal);

        if (roleSet.Contains("ADMIN") || roleSet.Contains("IT_ADMIN"))
        {
            permissions.UnionWith(allPolicies.Where(policy => !string.IsNullOrWhiteSpace(policy)));
        }

        return permissions.ToArray();
    }
}
