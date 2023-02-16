// not in use but saved for now. Since I do not know if the dropbox accestoken has time restrictions

export function goUpload(imagePath, file) {
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

export function goDelete(file) {
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
