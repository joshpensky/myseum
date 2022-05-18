import { ClientAPI } from './client';
import { MockAPI } from './mock';
import { MyseumAPI } from './type';

let api: MyseumAPI;
if (process.env.USE_MOCK_API === 'true') {
  api = MockAPI;
} else {
  api = ClientAPI;
}

export default api;
