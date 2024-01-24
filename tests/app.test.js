const { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } = require("@jest/globals");
const { setupStrapi, stopStrapi } = require("./helpers/strapi");
const request = require('supertest');

let authenticatedUser;

beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
    // Perform user authentication and obtain the JWT token
    const authResponse = await request(strapi.server.httpServer)
    .post("/api/auth/local")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      identifier: "tester@strapi.com", // Use the correct identifier for your test user
      password: "1234abc", // Use the correct password for your test user
    });

  // Store the JWT token for future requests
  authenticatedUser = authResponse.body.jwt;
});

afterAll(async () => {
  await stopStrapi();
});


describe("Strapi is defined", () => {
  it("just works", () => {
    // const
    expect(strapi).toBeDefined();
  });
})

it('Parking Image should return 200', async () => {
  await request(strapi.server.httpServer)
    .get('/api/parking-imgs')
    .set('Authorization', 'Bearer ' + authenticatedUser)
    .expect(200);
});

describe("Parking Image API", () => {
  it("should create a new record with unique parkingId and Document_Name", async () => {
    const uniqueParkingId = "unique_parking_id2"; // Replace with a unique parkingId else the tc will fail
    const uniqueDocumentName = "unique_document_name2"; // Replace with a unique Document_Name

    // Send a request to create a new record
    const response = await request(strapi.server.httpServer)
      .post('/api/parking-imgs')
      .set('Authorization', 'Bearer ' + authenticatedUser)
      .send({
        data: {
          parkingId: uniqueParkingId,
          Document_Name: uniqueDocumentName,
          // Add other required fields here
        }
      });

    // Assert the expected response status
    expect(response.status).toBe(200); // Adjust the status code as needed

    // Assert that the response body does not contain an error message
    expect(response.body).not.toHaveProperty('error');

    // Assert that the response body contains the created record
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.attributes.parkingId).toBe(uniqueParkingId);
    expect(response.body.data.attributes.Document_Name).toBe(uniqueDocumentName);
    // Add assertions for other fields as needed
  });
});

it("should return a 400 error for a duplicate parkingId and Document_Name", async () => {
  // Replace with an existing parkingId and Document_Name in your database
  const existingParkingId = "unique_parking_id2";
  const existingDocumentName = "unique_document_name2";

  // Send a request to create a record with duplicate parkingId and Document_Name
  const response = await request(strapi.server.httpServer)
    .post('/api/parking-imgs')
    .set('Authorization', 'Bearer ' + authenticatedUser)
    .send({
      data: {
        parkingId: existingParkingId,
        Document_Name: existingDocumentName,
        // Add other required fields here
      }
    });

  // Assert the expected response status for validation error
  expect(response.status).toBe(400); // Adjust the status code as needed

  // Assert that the response body contains an error message
  expect(response.body).toHaveProperty('error');
  expect(response.body.error.message).toBe('Record with the same parkingId and Document_Name already exists');
});

it("should delete an existing record and trigger afterDelete hook", async () => {
  // Send a request to delete the created record, manage the doc id accordingly in this case 16 exists
  const response = await request(strapi.server.httpServer)
    .delete(`/api/parking-imgs/16`)
    .set('Authorization', 'Bearer ' + authenticatedUser)

  // Assert the expected response status
  expect(response.status).toBe(200); // Adjust the status code as needed

  // Assert that the response body does not contain an error message
  expect(response.body).not.toHaveProperty('error');

  // Assert that the response body contains the deleted record
  expect(response.body).toHaveProperty('data');
  expect(response.body.data).toHaveProperty('id');
  expect(response.body.data.attributes.parkingId).toBe("unique_parking_id2");
  expect(response.body.data.attributes.Document_Name).toBe("unique_document_name2");

  // Assert that the record no longer exists in the database (simulating a GET request after deletion)
  const getResponse = await request(strapi.server.httpServer)
    .get(`/api/parking-imgs/16`)
    .set('Authorization', 'Bearer ' + authenticatedUser)
  
  // Assert that the GET request returns a 404 status
  expect(getResponse.status).toBe(404);
});

it("should return a 404 error for deleting a non-existing record", async () => {
  // Send a request to delete a non-existing record
  const response = await request(strapi.server.httpServer)
    .delete('/api/parking-imgs/69')
    .set('Authorization', 'Bearer ' + authenticatedUser)

  // Assert the expected response status for a non-existing record
  expect(response.status).toBe(404); // Adjust the status code as needed

  // Assert that the response body contains an error message
  expect(response.body).toHaveProperty('error');
  expect(response.body.error.message).toBe('Not Found');
});

// user inside helpers 
require('./user');