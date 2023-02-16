// This is a working example using FTP file saving instead of dropbox saved only as backup for when we deprecate dropbox.
import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import Client from "ftp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const directoryPath = path.join(__dirname, "images");

const shop = process.env.SHOP;
const globalProductUrl = `https://${shop}.myshopify.com/admin/api/2022-10/products.json`;
const config = {
  headers: {
    "X-Shopify-Access-Token": process.env.ADMIN_KEY,
    "content-type": "application/json",
    "Accept-Encoding": "gzip,deflate,compress",
  },
};

const getAllProducts = function getAllProducts() {
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
};
const updateVariant = function updateVariant(id, image_id) {
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
          console.log("Status: ", _res.status);
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
};
const postImage = function postImage(id, imageUrl) {
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
};
const checkForMatch = function checkForMatch(filename, productUrl) {
  return new Promise((resolve) => {
    try {
      const decapitalize = (val) => val.toLowerCase();
      let sku = filename.split(".")[0].slice(-3);
      let vendor = filename.split(/[\d]/g)[0].trim().replace(/ /g, "-");
      let fileObject = {
        filename: filename,
        vendor: decapitalize(vendor),
        sku: sku,
      };
      let matchesVendor = productUrl.includes(fileObject.vendor);
      let productArr = productUrl.split("-");
      let index = productArr.length - 1;
      let matchesSku = productArr[index].includes(fileObject.sku);
      if (matchesVendor && matchesSku) {
        resolve(fileObject);
      } else {
        resolve(false);
      }
    } catch (err) {
      console.error("Before post error: " + err.message);
    }
  });
};

async function startFlow() {
  let temp = await getAllProducts();
  let products = temp.products;
  let files = await fs.promises.readdir("./images");

  let nothing = [];
  for (let i = 0; i < products?.length; i++) {
    if (products[i].status === "draft" && !products[i].image) {
      console.log("status draft and no image found");
      nothing.push("new item");
      // ------------------------------------------------------------------------------------------------------>LOOP THROUGH THE FILES FOUND IN THE FS DIRECTORY FOR THE RIGHT FILENAME
      for (let file of files) {
        let fileObject = await checkForMatch(file, products[i].handle);
        if (fileObject) {
          await goUpload(path.join(__dirname, "images", fileObject["filename"]), fileObject["filename"]);
          await new Promise((resolve) => setTimeout(resolve, 1500));

          console.log("found a match and got a fileObject: ", fileObject);
          if (products?.length) {
            let variants = products[i].variants;
            if (!products[i].image && products[i].status === "draft") {
              // ------------------------------------------------------------------------------------------------>NEED A IMAGEURL FROM SERVED IMAGE
              let image = await postImage(products[i].id, encodeURI(`https://www.patientje.nl/monstermaatjes/${fileObject.filename}`));
              await new Promise((resolve) => setTimeout(resolve, 1500));
              if (products[i].variants.length > 0) {
                for (let j = 0; j < variants.length; j++) {
                  try {
                    let update = await updateVariant(variants[j].id, image.image.id);
                  } catch (err) {
                    console.log("Hier gaat het fout", err);
                  }
                }
              }
            }
          }
        } else {
          console.log("Found a photo without a matching product");
        }
      }
    }
  }
  if (nothing.length === 0) {
    console.log("Nothing new");
  }

  for (let file of files) {
    await goDelete(file);
  }
}

function goUpload(imagePath, file) {
  return new Promise((resolve) => {
    try {
      console.log("RUNNING", imagePath, "\n", file);
      let c = new Client();
      c.on("ready", function () {
        c.put(imagePath, `/monstermaatjes/${file}`, function (err) {
          if (err) throw err;
          c.end();
        });
      });
      c.connect({
        host: process.env.HOST,
        port: 21,
        user: process.env.USER,
        password: process.env.PASSWORD,
      });
    } catch (err) {
      console.error("err @: goUpload() " + err.message);
      return;
    }
    resolve("image upload done");
  });
}

function goDelete(file) {
  return new Promise((resolve) => {
    try {
      let c = new Client();
      c.on("err", function () {
        c.end();
      });
      c.on("ready", function () {
        c.delete(`/monstermaatjes/${file}`, function (err) {
          if (err) resolve("Can't delete " + file);
          c.end();
        });
      });
      c.connect({
        host: process.env.HOST,
        port: 21,
        user: process.env.USER,
        password: process.env.PASSWORD,
      });
    } catch (err) {
      console.error("err @: goDelete() " + err.message);
      return;
    }
    resolve("Deleting done");
  });
}

startFlow();
