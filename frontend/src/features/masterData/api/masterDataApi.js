import { httpClient } from '../../../api/httpClient.js';

export const masterDataApi = {
  getTrucks: () => httpClient.get('/master/trucks'),
  getDrivers: () => httpClient.get('/master/drivers'),
  getGuards: () => httpClient.get('/master/guards'),
  getCustomers: () => httpClient.get('/master/customers'),
  getProducts: () => httpClient.get('/master/products')
};
