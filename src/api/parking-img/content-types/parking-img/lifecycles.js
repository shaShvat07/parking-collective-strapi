const { ValidationError } = require("@strapi/utils").errors;
module.exports = {
  //beforeGet console
  async beforeCreate(event) {
    const data = event.params.data;
    const parkingId = data.parkingId;
    const Document_Name = data.Document_Name;
    // const ctx = strapi.requestContext.get();
    // // @ts-ignore
    // const files = ctx.request.files;
    const files = event.params.files || {};
    // console.log(files);
    const existingRecord = await strapi
      .query('api::parking-img.parking-img')
      .findOne({
        where: {
          parkingId,
          Document_Name,
        },
      });
    if (existingRecord || !parkingId || !Document_Name) {
      throw new ValidationError('Record with the same parkingId and Document_Name already exists');
    }
  },
  async beforeDelete(event) {
    const { where } = event.params;
    const { id } = where;

    // Retrieve the existing parking record
    const existingParking = await strapi
      .query('api::parking-img.parking-img')
      .findOne({
        where: { id: id },
        populate: { Img: true },
      });
    if (!existingParking) {
      throw new ValidationError('Parking record not found');
    } else {
      event.state = existingParking;
    }
  },

  async afterDelete(event) {
    const { where } = event.params;
    const { id } = where;
    const existingParking = event.state;
    if (existingParking.Img && existingParking.Img.length > 0) {
      // The following two lines are yet to be tested
      existingParking.Img.forEach(async (media) => {
        await strapi.plugins["upload"].services.upload.remove(media);
      });
    }
  }
};