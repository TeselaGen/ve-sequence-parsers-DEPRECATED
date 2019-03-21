export default function getArrayBufferFromFile(file) {
  if (typeof window === "undefined") {
    return toArrayBuffer(file);
  }

  var reader = new window.FileReader();
  return new Promise(function (resolve, reject) {
    reader.onload = function (e) {
      resolve(e.target.result);
    };
    reader.onerror = function (err) {
      console.error("err:", err);
      reject(err);
    };
    reader.readAsArrayBuffer(file);
  });
}

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}