// Test file to validate price list bulk creation
import { api, PriceListBulkData } from './src/api';

const testPriceList: PriceListBulkData = {
  price_list_id: "TEST_001",
  name: "Test Price List",
  currency: "USD",
  country: "Colombia",
  customer_type: "retail",
  channel: "online",
  start_date: "2024-01-01T00:00:00Z"
};

async function testPriceListAPI() {
  try {
    console.log('Testing price list bulk creation...');
    const result = await api.admin.priceLists.bulkCreate([testPriceList]);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Export for potential use
export { testPriceListAPI };