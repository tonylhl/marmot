'use strict';

// key: error code
// value: error details
//   value.message: default error message
module.exports = new Map([
  [
    'ERR_MARMOT_INTERNAL_SERVER_ERROR', {
      message: 'Internal server error.',
    },
  ],
  [
    'ERR_MARMOT_INVALID_PARAM_ERROR', {
      message: 'Invalid parameters.',
    },
  ],
  [
    'ERR_MARMOT_BUCKET_TAG_NOT_FOUND', {
      message: 'Bucket tag not found.',
    },
  ],
  [
    'ERR_MARMOT_BUCKET_BY_UNIQID_NOT_FOUND', {
      message: 'Bucket not found.',
    },
  ],
  [
    'ERR_MARMOT_BUCKET_SECRET_INCORRECT', {
      message: 'Bucket access secret incorrect.',
    },
  ],
  [
    'ERR_MARMOT_BRANCH_RECORD_NOT_FOUND', {
      message: 'Branch record not found.',
    },
  ],
  [
    'ERR_MARMOT_BUILD_RECORD_NOT_FOUND', {
      message: 'Build record not found.',
    },
  ],
  [
    'ERR_MARMOT_BUCKET_SECRETKEY_NOT_SET', {
      message: 'Bucket access secret not set.',
    },
  ],
  [
    'ERR_MARMOT_DEPLOY_TYPE_NOT_FOUND', {
      message: 'Deploy type not found.',
    },
  ],
  [
    'ERR_MARMOT_DEPLOY_FAILED', {
      message: 'Deploy failed.',
    },
  ],
]);
