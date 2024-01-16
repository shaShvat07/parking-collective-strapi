const fs = require('fs');
const { setupStrapi, cleanupStrapi } = require('./helpers/strapi');

let strapi; 

beforeAll(async () => {
  strapi = await setupStrapi(); 
});

afterAll(async () => {
  const dbSettings = strapi.config.get('database.connections.default.settings');
  await cleanupStrapi();
});

it('strapi is defined', () => {
  expect(strapi).toBeDefined();
});
