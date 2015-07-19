module.exports = function (logger) {
  return {
    remove: function (obj, array) {
      if (array.indexOf) {
        var index = array.indexOf(obj);
        if (index !== -1) {
          return array.splice(index, 1);
        }
        else {
          logger.log("Object does not exist in array");
        }
      }
      else {
        logger.log("Array.indexOf does not exist.  Unsupported function.");
      }

      return false;
    }
  };
}
