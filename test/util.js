'use strict';

exports.sleep = time => {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve();
    }, time);
  });
};
