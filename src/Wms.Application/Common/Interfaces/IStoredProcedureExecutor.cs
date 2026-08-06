namespace Wms.Application.Common.Interfaces;

public interface IStoredProcedureExecutor
{
    Task<IEnumerable<T>> QueryAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default);
    Task<T?> QueryFirstOrDefaultAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default);
    Task<int> ExecuteAsync(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default);
}
