import axios from "axios";

const shop = process.env.SHOP;
const globalProductUrl = `https://${shop}.myshopify.com/admin/api/2022-10/products.json`;
const config = {
  headers: {
    "X-Shopify-Access-Token": process.env.ADMIN_KEY,
    "content-type": "application/json",
    "Accept-Encoding": "gzip,deflate,compress",
  },
};

export function getAllProducts() {
  return new Promise((resolve) => {
    try {
      axios
        .get(globalProductUrl, config)
        .then((_res) => {
          resolve(_res.data);
        })
        .catch((err) => {
          console.log("err", err.cause);
        });
    } catch (err) {
      console.error("Before post error: " + err.message);
    }
  });
}
export function updateVariant(id, image_id) {
  return new Promise((resolve) => {
    try {
      const specificProductUrl = `https://${shop}.myshopify.com/admin/api/2022-10/variants/${id}.json`;
      let body = {
        variant: {
          variant_id: id,
          image_id: image_id,
        },
      };
      axios
        .put(specificProductUrl, body, config)
        .then((_res) => {
          // console.log("Status: ", _res.status);
          let data = _res.data;
          // console.log("Headers: ", _res.data);
          resolve(data);
        })
        .catch((err) => {
          console.log(err.message);
          console.log(err.data);
          resolve("Error");
        });
    } catch (err) {
      console.error("Before post error: " + err.message);
    }
  });
}
export function postImage(id, imageUrl) {
  return new Promise((resolve) => {
    try {
      const specificProductUrl = `https://${shop}.myshopify.com/admin/api/2022-10/products/${id}/images.json`;
      const postBody = {
        image: {
          src: imageUrl,
        },
      };
      axios
        .post(specificProductUrl, postBody, config)
        .then((_res) => {
          console.log("Status: ", _res.status);
          // console.log("Headers: ", _res.data);
          resolve(_res.data);
        })
        .catch((err) => {
          console.log(err.message);
          console.log(err.data);
          // console.log("err", err)
          resolve("Error");
        });
    } catch (err) {
      console.error("Before post error: " + err.message);
    }
  });
}
