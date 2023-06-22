/* eslint-disable @typescript-eslint/no-var-requires */
const withAntdLess = require('next-plugin-antd-less');
const { PHASE_PRODUCTION_BUILD } = require('next/constants');

const COLORS = {
    GREY: '#303030',
    PURPLE: '#512da8',
};

module.exports = function (phase, { defaultConfig }) {
    // See https://github.com/SolidZORO/next-plugin-antd-less
    const config = withAntdLess({
        // Note this produces an unnecessary warning:
        // 'The root value has an unexpected property, modifyVars'
        // See https://github.com/SolidZORO/next-plugin-antd-less/issues/105
        modifyVars: {
            '@background': COLORS.GREY,
            '@primary-color': COLORS.PURPLE,
        },
        basePath: phase === PHASE_PRODUCTION_BUILD ? '/wallet-adapter/example' : '',
    });

    return config;
};
