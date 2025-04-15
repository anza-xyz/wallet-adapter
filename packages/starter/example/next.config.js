/* eslint-disable @typescript-eslint/no-var-requires */
const { PHASE_PRODUCTION_BUILD } = require('next/constants');

module.exports = function (phase, { defaultConfig }) {
    return {
        basePath: phase === PHASE_PRODUCTION_BUILD ? '/wallet-adapter/example' : '',
    };
};
