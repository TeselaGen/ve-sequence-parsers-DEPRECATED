export function unmangleUrls(str) {
  if (!str)
    return str;
  if (typeof str !== "string")
    return str;

  const urlRegex = /%%TG%%_(.*?)_%%TG%%/g;
  return str.replace(urlRegex, function (outer, innerUrl) {
    if (innerUrl) {
      return `${decodeURIComponent(innerUrl)}`;
    }
    return outer;
  });
}

export function mangleUrls(str) {
  if(!str) return str;
 
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  return str.replace(urlRegex, function (url) {
    return `%%TG%%_${encodeURIComponent(url)}_%%TG%%`
  });
}
