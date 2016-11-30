"use strict";
var Util_1 = require("../src/Util");
var lodash = require('lodash');
var stringify = require('json-stable-stringify');
var TestUtil = (function () {
    function TestUtil() {
    }
    TestUtil.compareJSONArrays = function (input, expected, sortKey) {
        var a = lodash.countBy(input, stringify);
        var b = lodash.countBy(expected, stringify);
        var firstEqual = lodash.isEqual(a, b);
        if (!firstEqual) {
            Util_1.default.warn('compareJSONArray failure: ');
            Util_1.default.trace('compareJSONArray expected: ' + JSON.stringify(expected));
            Util_1.default.trace('compareJSONArray actual v: ' + JSON.stringify(input));
            return false;
        }
        if (sortKey !== null) {
            if (input.length > 0) {
                var previous = (input[0])[sortKey];
                var current = void 0;
                for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
                    var entry = input_1[_i];
                    current = entry[sortKey];
                    if (previous > current) {
                        Util_1.default.warn('compareJSONArray sort failure (on ' + sortKey + ' )');
                        Util_1.default.trace('compareJSONArray expected: ' + JSON.stringify(previous) + " to be less than: " + JSON.stringify(current));
                        return false;
                    }
                    previous = current;
                }
            }
        }
        return true;
    };
    return TestUtil;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestUtil;
//# sourceMappingURL=TestUtil.js.map