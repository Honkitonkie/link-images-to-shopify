export function checkForMatch(filename, productUrl) {
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
}
