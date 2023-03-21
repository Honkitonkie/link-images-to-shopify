import * as dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";
import axios from "axios";
import path, { resolve } from "path";
import fs from "fs";
import { Dropbox } from "dropbox";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

export function goUpload(imagePath, fileName) {
  return new Promise((resolve) => {
    try {
      fs.readFile(path.join(imagePath, fileName), (err, contents) => {
        if (err) {
          console.log("Error: ", err);
        }
        dbx
          .filesUpload({ path: "/" + fileName, contents })
          .then((response) => {
            resolve(response.result.path_lower);
          })
          .catch((uploadErr) => {
            console.log(uploadErr);
            resolve();
          });
      });
    } catch (err) {
      console.log("some error here"), err;
    }
  });
}

export function goDelete(fileName) {
  fs.readFile(path.join(__dirname, "..", "images", fileName), async (err, contents) => {
    if (err) {
      console.log("Error @ goDelete: ", err);
    }
    // let del = await deleteFile(fileName);
  });
}

export function getImageUrl(thePath) {
  return new Promise((resolve) => {
    let url = `https://api.dropboxapi.com/2/files/get_temporary_link`;
    let body = JSON.stringify({
      path: thePath,
    });
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
        "Content-type": "application/json",
      },
    };
    axios
      .post(url, body, config)
      .then((_res) => {
        resolve(_res.data.link);
      })
      .catch((err) => {
        console.log("Something went wrong with getting the url in axios");
        resolve("Something went wrong with getting the url in axios");
      });
  });
}

export function deleteFile(thePath) {
  return new Promise((resolve) => {
    let url = `https://api.dropboxapi.com/2/files/delete_v2 `;
    let body = JSON.stringify({
      path: "/" + thePath,
    });
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
        "Content-type": "application/json",
      },
    };
    axios
      .post(url, body, config)
      .then((_res) => {
        resolve(_res.data);
      })
      .catch((err) => {
        resolve("Something went wrong with deleting the fule in axios");
      });
  });
}
