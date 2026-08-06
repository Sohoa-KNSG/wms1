using System.Data;
using Dapper;
using Wms.Application.Common.Interfaces;

namespace Wms.Infrastructure.Persistence;

public class StoredProcedureExecutor : IStoredProcedureExecutor
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public StoredProcedureExecutor(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<T>> QueryAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        return await connection.QueryAsync<T>(storedProcedure, parameters, commandType: CommandType.StoredProcedure);
    }

    public async Task<T?> QueryFirstOrDefaultAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        return await connection.QueryFirstOrDefaultAsync<T>(storedProcedure, parameters, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> ExecuteAsync(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        return await connection.ExecuteAsync(storedProcedure, parameters, commandType: CommandType.StoredProcedure);
    }
}
