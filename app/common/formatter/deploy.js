'use strict';

const urlParser = require('url');

exports.formatDeployUrl = ({ url, customDomainOrigin }) => {
  const _url = urlParser.parse(url);
  const regexp = new RegExp(`^${_url.protocol}//${_url.host}`);
  return url.replace(regexp, customDomainOrigin);
};

