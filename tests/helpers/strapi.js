const Strapi = require("@strapi/strapi");
const fs = require("fs");

let instance;

async function setupStrapi() {
  if (!instance) {
    await Strapi().load();
    instance = strapi;
    
    await instance.server.mount();
  }
  return instance;
}

async function cleanupStrapi() {
  // Close server to release the db-file
  await instance.server.httpServer.close();

  // Close the connection to the database before deletion
  await instance.db.connection.destroy();

  instance = null; // Reset instance to null after cleanup
}

module.exports = { setupStrapi, cleanupStrapi };
