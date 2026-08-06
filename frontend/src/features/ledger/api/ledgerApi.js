import { httpClient } from '../../../api/httpClient.js';

export const ledgerApi = {
  getTransactions: (params) => httpClient.get('/ledger/transactions', { params }),
  getTransactionDetail: (id) => httpClient.get(`/ledger/transactions/${id}/details`)
};
