/**
 * Alokai SDK instance.
 *
 * Usage:  import { sdk } from '../../sdk';  await sdk.myapi.getProducts();
 */
import { initSDK, buildModule } from '@vue-storefront/sdk';
import { myApiModule } from './myapi';
import { middlewareUrl } from '../middleware/api/config';

const sdkConfig = {
  myapi: buildModule(myApiModule, { apiUrl: middlewareUrl }),
};

export const sdk = initSDK(sdkConfig);

export type Sdk = typeof sdk;
