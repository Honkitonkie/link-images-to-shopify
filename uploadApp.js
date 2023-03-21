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
  let something = [];
  for (let i = 0; i < products?.length; i++) {
    // if (products[i].status === "draft" && !products[i].image) {
    if (products[i].status === "draft") {
      // console.log("status draft and no image found");

      nothing.push("new item");
      // ------------------------------------------------------------------------------------------------------>LOOP THROUGH THE FILES FOUND IN THE FS DIRECTORY FOR THE RIGHT FILENAME
      // for (let file of files) {
      //   // switched to reversed loop because the backside was uploaded first.
        for (let k = files.length -1; k >= 0; k--) {
          let file = files[k];

        let fileObject = await checkForMatch(file, products[i].handle);

        

        if (fileObject) {

          console.log("Matchende foto gevonden --> ", fileObject.filename)
          // console.log("Matchende foto gevonden --> ", fileObject)

          let thePath = await goUpload(path.join(__dirname, "images"), fileObject["filename"]);
          let imageLink = await getImageUrl(thePath);
          // console.log("ImageLink", imageLink);
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // console.log("found a match and got a fileObject: ", fileObject);
          if (products?.length) {
            let variants = products[i].variants;
            let image_id;

            
            if (!products[i].image) {
              // ------------------------------------------------------------------------------------------------>NEED A IMAGEURL FROM SERVED IMAGE
              let fileName = fileObject["filename"].split(" ").join("+");
              // console.log("fileName", fileName); 
              let picIsBoven = file.includes("_boven_") || file.includes("_top_")
              let image = await postImage(products[i].id, imageLink, picIsBoven);
              image_id = image.id
              await new Promise((resolve) => setTimeout(resolve, 2500));
              if (products[i].variants.length > 0) {
                for (let j = 0; j < variants.length; j++) {
                  try {
                    let update = await updateVariant(variants[j].id, image.image.id);
                  } catch (err) {
                    console.log("Hier gaat het fout", err);
                  }
                }
              }
            } else {
              if(image_id) {
                console.log("it exists", image_id)
                console.log("\n on: ", products[i])
                let image = await postImage(products[i].id, imageLink, picIsBoven, image_id);
              }
            }
          }
        } else {
          if (!something.includes(products[i].vendor, "met id: ", products[i].title.slice(-4, -1))) {
            something.push(products[i].vendor, " met id: ", products[i].title.slice(-4, -1));
            console.log("Product van ", products[i].vendor, "met id:", products[i].title.slice(-4, -1), " gevonden in Shopify zonder foto maar lokaal geen matchend bestand gevonden om te koppelen.");
          }
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
console.log("running...")
