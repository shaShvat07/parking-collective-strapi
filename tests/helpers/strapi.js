// const Strapi = require("@strapi/strapi");
// const fs = require("fs");

// let instance;

// async function setupStrapi() {
//   if (!instance) {
//     await Strapi().load();
//     instance = strapi;
//     await instance.server.mount();
//   }
//   return instance;
// }
// async function cleanupStrapi() {
//   await instance.server.httpServer.close();
//   await instance.db.connection.destroy();
//   instance = null;
// }
// module.exports = { setupStrapi, cleanupStrapi };


const Strapi = require("@strapi/strapi");
const fs = require("fs");
const _ = require("lodash");

let instance;

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const waitForServer = () =>
  new Promise((resolve, reject) => {
    const onListen = async (error) => {
      if (error) {
        return reject(error);
      }

      try {
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    const listenSocket = strapi.config.get("server.socket");

    if (listenSocket) {
      strapi.server.listen(listenSocket, onListen);
    } else {
      const { host, port } = strapi.config.get("server");
      strapi.server.listen(port, host, onListen);
    }

  });

/**
 * Setups strapi for futher testing
 */
async function setupStrapi() {
  if (!instance) {
    /** the follwing code in copied from `./node_modules/strapi/lib/Strapi.js` */
    await Strapi().load();
    await waitForServer();
    instance = strapi; // strapi is global now
  }
  return instance;
}

/**
 * Closes strapi after testing
 */
async function stopStrapi() {
  if (instance) {
    
    instance.destroy();
    
    const tmpDbFile = strapi.config.get(
      "database.connection.connectionString.strapi"
    );

    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
  return instance;
}


module.exports = {
  setupStrapi,
  stopStrapi,
  sleep,
};
