'use strict';

/**
 * parking-img service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// @ts-ignore
module.exports = createCoreService('api::parking-img.parking-img');
