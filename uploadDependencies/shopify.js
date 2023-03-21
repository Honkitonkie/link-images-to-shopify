import axios from "axios";

const shop = process.env.SHOP;
const globalProductUrl = `https://${shop}.myshopify.com/admin/api/2022-10/products.json?status=draft&limit=250`;
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
          console.log("err shopify", err.cause);
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
          console.log("UpdateVariant", err.message);
          console.log("UpdateVariant", err.data);
          resolve("Error");
        });
    } catch (err) {
      console.error("Before post error: " + err.message);
    }
  });
}
export function postImage(id, imageUrl, picIsBoven) {
  return new Promise((resolve) => {
    try {
      const specificProductUrl = `https://${shop}.myshopify.com/admin/api/2022-10/products/${id}/images.json`;
      let check = picIsBoven === true ? 2 : 1;
      const postBody = {
        image: {
          src: imageUrl,
          position: check,
        },
      };
      // console.log("check", check, "\nbody: \n", postBody)
      axios
        .post(specificProductUrl, postBody, config)
        .then((_res) => {
          if(_res.status === 200) {
            console.log("Upload geslaagd!")
          } else {
            console.log("upload status: ", _res.status);
          }
          resolve(_res.data);
        })
        .catch((err) => {
          console.log("message hier -->", err.message);
          console.log(err.data);
          console.log(err.headers);
          resolve("Error");
        });
    } catch (err) {
      console.error("Before post error: " + err.message);
    }
  });
}
