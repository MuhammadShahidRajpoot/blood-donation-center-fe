/* eslint-disable */

export const getAppBaseUrl = () => {
  const currentUrl = window.location.href;
  const urlObject = new URL(currentUrl);
  return `${urlObject.protocol}//${urlObject.hostname}:${urlObject.port}`;
};
