export function checkForMatch(filename, productUrl) {
  return new Promise((resolve) => {
    try {
      const decapitalize = (val) => val.toLowerCase();
      let sku = filename.split(".")[0].slice(-3);
      let kant = filename.split("-")[1]
      let vendor = filename.split("-")[0].split(/[\d]/g)[0].trim().replace(/ /g, "-").replace(/'/g, "");
      
      // Before extra split was added to catch _voor_ & _achter_ suffixes 
      // let vendor = filename.split(/[\d]/g)[0].trim().replace(/ /g, "-");

      let fileObject = {
        filename: filename,
        vendor: decapitalize(vendor),
        sku: sku,
        kant: kant,
      };


      // console.log(productUrl, fileObject.vendor)
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
}
