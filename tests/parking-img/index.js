const request = require('supertest');
const strapi = require('@strapi/strapi');

// Simple in-memory data structure acting as a "dummy" database
const dummyDatabase = {
  parkingImages: [
    { id: 1, parkingId: '1', Document_Name: 'example_document_1', Images: ['image1.jpg', 'image2.jpg'] },
    { id: 2, parkingId: '2', Document_Name: 'example_document_2', Images: ['image3.jpg', 'image4.jpg'] },
    // Add more dummy data as needed
  ],
};

let strapiServer;

beforeAll(async () => {
  // Create a mock Strapi instance to override the find method
  const mockStrapi = {
    query(model) {
      return {
        find: jest.fn((params) => {
          // Simulate a database query by filtering the dummy data
          const results = dummyDatabase[model].filter(item => {
            for (const key in params) {
              if (item[key] !== params[key]) {
                return false;
              }
            }
            return true;
          });

          return results;
        }),
      };
    },
  };

  // Initialize Strapi using the mock instance
  const instance = strapi(); // Modified line
  await instance.load(mockStrapi);

  // Save the Strapi server instance
  strapiServer = instance.server;

  // Additional setup, if any

  // Close the Strapi server after setup is complete
  await strapiServer.close();
});

describe('GET Parking Image by ID', () => {
  it('should successfully retrieve a parking image by ID', async () => {
    const parkingId = 1;

    // Make a GET request to the /api/parking-imgs/:id endpoint
    const response = await request(strapiServer)
      .get(`/api/parking-imgs/${parkingId}`);

    // Check if the response is as expected
    expect(response.status).toBe(200); // Assuming a successful response has HTTP status code 200
    expect(response.body).toEqual(dummyDatabase.parkingImages.find(img => img.id === parkingId));
    // Adjust based on your actual response structure
  });

  // Add more test cases as needed for different scenarios
});

afterAll(async () => {
  // Close the Strapi server after all tests are done
  await strapiServer.close();
});
