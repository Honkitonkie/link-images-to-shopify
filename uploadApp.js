import * as dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";

import { goUpload, goDelete, getImageUrl } from "./uploadDependencies/dropbox.js";
import { checkForMatch } from "./uploadDependencies/helpers.js";
import { postImage, updateVariant, getAllProducts } from "./uploadDependencies/shopify.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startFlow() {
  let temp = await getAllProducts();
  let products = temp.products;
  let files = await fs.promises.readdir("./images");

  let nothing = [];
  for (let i = 0; i < products?.length; i++) {
    if (products[i].status === "draft" && !products[i].image) {
      // console.log("status draft and no image found");
      nothing.push("new item");
      // ------------------------------------------------------------------------------------------------------>LOOP THROUGH THE FILES FOUND IN THE FS DIRECTORY FOR THE RIGHT FILENAME
      for (let file of files) {
        let fileObject = await checkForMatch(file, products[i].handle);
        if (fileObject) {
          let thePath = await goUpload(path.join(__dirname, "images"), fileObject["filename"]);
          let imageLink = await getImageUrl(thePath);
          // console.log("ImageLink", imageLink);
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // console.log("found a match and got a fileObject: ", fileObject);
          if (products?.length) {
            let variants = products[i].variants;
            if (!products[i].image && products[i].status === "draft") {
              // ------------------------------------------------------------------------------------------------>NEED A IMAGEURL FROM SERVED IMAGE
              //   let image = await postImage(products[i].id, encodeURI(`https://www.patientje.nl/monstermaatjes/${fileObject.filename}`));
              const regex = /s/g;
              let fileName = fileObject["filename"].split(" ").join("+");
              console.log("fileName", fileName);
              let image = await postImage(products[i].id, imageLink);
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
  } else {
    for (let file of files) {
      await goDelete(file);
    }
  }
}

startFlow();

// goUpload(path.join(__dirname, "images"), "roberto dangelo 069.gif");
// goUpload(path.join(__dirname, "images"), "roberto dangelo 070.jpg");
