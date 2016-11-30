"use strict";
var Util_1 = require("../Util");
var QueryController = (function () {
    function QueryController(datasets) {
        this.datasets = null;
        this.nameMapping = {};
        this.nameChangeBack = {};
        this.buildingName = {};
        this.datasets = datasets;
    }
    QueryController.prototype.check_get_keys = function (query) {
        var groupApply = {};
        var groupApplyArr = [];
        var x = query['GET'][0];
        var id = x.slice(0, x.indexOf("_"));
        for (var _i = 0, _a = query['GET']; _i < _a.length; _i++) {
            var key = _a[_i];
            if (key.indexOf("_") != -1 && key.slice(0, key.indexOf("_")) != id) {
                return false;
            }
        }
        if ('GROUP' in query && 'APPLY' in query) {
            var group = query['GROUP'];
            var apply = query['APPLY'];
            var get = [];
            for (var i = 0; i < group.length; i++) {
                groupApply[group[i]] = true;
            }
            for (var i = 0; i < apply.length; i++) {
                for (var key in apply[i]) {
                    groupApply[key] = true;
                }
            }
            for (var entry in groupApply) {
                if (groupApply.hasOwnProperty(entry)) {
                    groupApplyArr.push(entry);
                }
            }
            for (var i = 0; i < query['GET'].length; i++) {
                get.push(query['GET'][i]);
            }
            groupApplyArr.sort();
            get.sort();
            if (get.length != groupApplyArr.length) {
                return false;
            }
            else {
                for (var i = 0; i < get.length; i++) {
                    if (get[i] != groupApplyArr[i]) {
                        return false;
                    }
                }
            }
            return true;
        }
        return true;
    };
    QueryController.prototype.checkValidKey = function (query) {
        var keys = {};
        var kWithoutUnderscore = {};
        for (var _i = 0, _a = query['GET']; _i < _a.length; _i++) {
            var k = _a[_i];
            keys[k] = true;
        }
        if ('GROUP' in query) {
            for (var _b = 0, _c = query['GROUP']; _b < _c.length; _b++) {
                var k = _c[_b];
                keys[k] = true;
            }
        }
        if ('APPLY' in query) {
            for (var _d = 0, _e = query['APPLY']; _d < _e.length; _d++) {
                var appl = _e[_d];
                for (var k in appl) {
                    kWithoutUnderscore[k] = true;
                    for (var c in appl[k]) {
                        keys[appl[k][c]] = true;
                        break;
                    }
                    break;
                }
            }
        }
        if ('ORDER' in query) {
            var order = query['ORDER'];
            if (typeof order !== 'object') {
                keys[order] = true;
            }
            else {
                for (var _f = 0, _g = query['ORDER']['keys']; _f < _g.length; _f++) {
                    var k = _g[_f];
                    keys[k] = true;
                }
            }
        }
        for (var k in keys) {
            if (k.indexOf('_') == -1 && !(k in kWithoutUnderscore)) {
                return false;
            }
        }
        return true;
    };
    QueryController.prototype.isValid = function (query) {
        if (typeof query == 'undefined' || query == null || Object.keys(query).length < 0) {
            return false;
        }
        if (!('GET' in query) || !('AS' in query)) {
            return false;
        }
        if ('APPLY' in query && !('GROUP' in query)) {
            return false;
        }
        if ('GROUP' in query && !('APPLY' in query)) {
            return false;
        }
        if ('GROUP' in query && query['GROUP'].length == 0) {
            return false;
        }
        if (!this.check_get_keys(query)) {
            return false;
        }
        if (!this.checkValidKey(query)) {
            return false;
        }
        return true;
    };
    QueryController.prototype.getDataset = function (id) {
        if (id == 'rooms' && id in this.datasets) {
            this.buildingName = {};
            var e = void 0;
            for (var _i = 0, _a = this.datasets[id]; _i < _a.length; _i++) {
                e = _a[_i];
                this.buildingName[e['rooms_fullname']] = e;
            }
        }
        return id in this.datasets ? this.datasets[id] : null;
    };
    QueryController.prototype.deleleDataset = function (id) {
        if (this.datasets.hasOwnProperty(id)) {
            delete this.datasets[id];
            return true;
        }
        return false;
    };
    QueryController.prototype.query = function (query) {
        Util_1.default.trace('QueryController::query( ' + JSON.stringify(query) + ' )');
        var that = this;
        var x = query['GET'][0];
        var id = x.slice(0, x.indexOf("_"));
        return new Promise(function (fulfill, reject) {
            var dataset = that.getDataset(id);
            if (!dataset) {
                reject({ missing: [id] });
            }
            console.log('Got dataset');
            var filterKeys = {};
            for (var _i = 0, _a = query['GET']; _i < _a.length; _i++) {
                var key = _a[_i];
                console.log('the key is: ' + key);
                filterKeys[key] = true;
            }
            if ("APPLY" in query) {
                for (var _b = 0, _c = query['APPLY']; _b < _c.length; _b++) {
                    var appl = _c[_b];
                    for (var k in appl) {
                        for (var c in appl[k]) {
                            filterKeys[appl[k][c]] = true;
                            break;
                        }
                        break;
                    }
                }
            }
            console.log("Filter keys are: ", filterKeys);
            var result = [];
            for (var _d = 0, dataset_1 = dataset; _d < dataset_1.length; _d++) {
                var entry = dataset_1[_d];
                if (that.check_condition(entry, query['WHERE'])) {
                    result.push(that.filter(entry, filterKeys));
                }
                ;
            }
            ;
            var orderIsString = (_e = {}, _e[id + "_dept"] = 1, _e[id + "_id"] = 1, _e[id + "_instructor"] = 1, _e[id + "_title"] = 1, _e);
            if (id == "rooms") {
                orderIsString = (_f = {}, _f[id + "_fullname"] = 1, _f[id + "_shortname"] = 1, _f[id + "_number"] = 1, _f[id + "_name"] = 1, _f[id + "_address"] = 1, _f[id + "_type"] = 1, _f[id + "_furniture"] = 1, _f[id + "_href"] = 1, _f);
            }
            var epsilon = 0.001;
            function make_sort_function(sortKey, upOrDown) {
                return function (a, b) {
                    for (var _i = 0, sortKey_1 = sortKey; _i < sortKey_1.length; _i++) {
                        var i = sortKey_1[_i];
                        var x_1 = void 0, y = void 0;
                        if (i in orderIsString) {
                            x_1 = a[i];
                            y = b[i];
                        }
                        else {
                            x_1 = Number(a[i]);
                            y = Number(b[i]);
                            if (Math.abs(x_1 - y) < epsilon) {
                                continue;
                            }
                        }
                        if (x_1 < y) {
                            return -1 * upOrDown;
                        }
                        if (x_1 > y) {
                            return upOrDown;
                        }
                    }
                    return 0;
                };
            }
            function compare(a, b, groupKeys) {
                for (var _i = 0, groupKeys_1 = groupKeys; _i < groupKeys_1.length; _i++) {
                    var key = groupKeys_1[_i];
                    if (a[key] != b[key]) {
                        return false;
                    }
                }
                return true;
            }
            var groups = [];
            if ("GROUP" in query && result.length > 0 && "APPLY" in query) {
                console.log(query['GROUP']);
                var grpKeys_1 = query["GROUP"];
                var applies_1 = query['APPLY'];
                result.sort(make_sort_function(grpKeys_1, 1));
                var comp_1 = {};
                var count_1 = 0;
                function start_new_group(startEntry) {
                    groups.push({});
                    for (var _i = 0, grpKeys_2 = grpKeys_1; _i < grpKeys_2.length; _i++) {
                        var i = grpKeys_2[_i];
                        groups[groups.length - 1][i] = startEntry[i];
                    }
                    comp_1 = {};
                    for (var _a = 0, applies_2 = applies_1; _a < applies_2.length; _a++) {
                        var appl = applies_2[_a];
                        for (var k in appl) {
                            comp_1[k] = 0;
                            if ('MIN' in appl[k]) {
                                comp_1[k] = 99999999;
                            }
                            break;
                        }
                    }
                    count_1 = 0;
                }
                start_new_group(result[0]);
                for (var i = 0; i < result.length; i += 1) {
                    var entry = result[i];
                    if (i > 0 && !compare(result[i - 1], entry, grpKeys_1)) {
                        for (var _g = 0, applies_3 = applies_1; _g < applies_3.length; _g++) {
                            var appl = applies_3[_g];
                            for (var k in appl) {
                                if ('AVG' in appl[k]) {
                                    groups[groups.length - 1][k] = Number((comp_1[k] * 1.0 / count_1).toFixed(2));
                                }
                                else if ('MIN' in appl[k]) {
                                    groups[groups.length - 1][k] = comp_1[k];
                                }
                                else if ('MAX' in appl[k]) {
                                    groups[groups.length - 1][k] = comp_1[k];
                                }
                                else {
                                    groups[groups.length - 1][k] = count_1;
                                }
                                break;
                            }
                        }
                        start_new_group(entry);
                    }
                    for (var _h = 0, applies_4 = applies_1; _h < applies_4.length; _h++) {
                        var appl = applies_4[_h];
                        for (var k in appl) {
                            if ('AVG' in appl[k]) {
                                comp_1[k] += entry[appl[k]['AVG']];
                            }
                            else if ('MIN' in appl[k]) {
                                comp_1[k] = Math.min(comp_1[k], entry[appl[k]['MIN']]);
                            }
                            else if ('MAX' in appl[k]) {
                                comp_1[k] = Math.max(comp_1[k], entry[appl[k]['MAX']]);
                            }
                            break;
                        }
                    }
                    count_1 += 1;
                }
                for (var _j = 0, applies_5 = applies_1; _j < applies_5.length; _j++) {
                    var appl = applies_5[_j];
                    for (var k in appl) {
                        if ('AVG' in appl[k]) {
                            groups[groups.length - 1][k] = Number((comp_1[k] * 1.0 / count_1).toFixed(2));
                        }
                        else if ('MIN' in appl[k]) {
                            groups[groups.length - 1][k] = comp_1[k];
                        }
                        else if ('MAX' in appl[k]) {
                            groups[groups.length - 1][k] = comp_1[k];
                        }
                        else {
                            groups[groups.length - 1][k] = count_1;
                        }
                        break;
                    }
                }
            }
            else {
                groups = result;
            }
            console.log("b4 ordering");
            if ("ORDER" in query) {
                var order = query["ORDER"];
                if (typeof order !== 'object') {
                    groups.sort(make_sort_function([order], 1));
                }
                else {
                    var upOrDown = -1;
                    var sortKey = order.keys;
                    if (order.dir == "UP") {
                        upOrDown = 1;
                    }
                    groups.sort(make_sort_function(sortKey, upOrDown));
                }
            }
            console.log('Number of entries returned: ' + groups.length);
            fulfill({ render: 'TABLE', result: groups });
            var _e, _f;
        });
    };
    QueryController.prototype.getDistance = function (entry, buildingName) {
        var source = this.buildingName[buildingName];
        function deg2rad(deg) {
            var rad = deg * Math.PI / 180;
            return rad;
        }
        var dlon = deg2rad(source["rooms_lon"]) - deg2rad(entry["rooms_lon"]);
        var dlat = deg2rad(source["rooms_lat"]) - deg2rad(entry["rooms_lat"]);
        var a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(deg2rad(entry["rooms_lat"])) * Math.cos(deg2rad(source["rooms_lat"])) * Math.pow((Math.sin(dlon / 2)), 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var R = 6373.0;
        var d = R * c;
        return d;
    };
    QueryController.prototype.check_condition = function (entry, cond) {
        if ('NOT' in cond) {
            return !this.check_condition(entry, cond['NOT']);
        }
        if ('IS' in cond) {
            var comp = cond['IS'];
            for (var key in comp) {
                if (comp[key].indexOf('*') != -1) {
                    var newComp = '^' + comp[key].split('*').join('.*') + '$';
                    var re = new RegExp(newComp);
                    if (!re.test(entry[key])) {
                        return false;
                    }
                }
                else {
                    if (entry[key] != comp[key]) {
                        return false;
                    }
                }
            }
            return true;
        }
        if ('AND' in cond) {
            var comp = cond['AND'];
            for (var _i = 0, comp_2 = comp; _i < comp_2.length; _i++) {
                var sub_cond = comp_2[_i];
                if (!this.check_condition(entry, sub_cond)) {
                    return false;
                }
            }
            return true;
        }
        if ('OR' in cond) {
            var comp = cond['OR'];
            for (var _a = 0, comp_3 = comp; _a < comp_3.length; _a++) {
                var sub_cond = comp_3[_a];
                if (this.check_condition(entry, sub_cond)) {
                    return true;
                }
            }
            return false;
        }
        if ('WITHIN' in cond) {
            var comp = cond['WITHIN'];
            var building = comp.building;
            var distance = Number(comp.distance);
            return distance > this.getDistance(entry, building);
        }
        if ('LT' in cond) {
            var comp = cond['LT'];
            for (var key in comp) {
                return Number(entry[key]) < Number(comp[key]);
            }
        }
        if ('GT' in cond) {
            var comp = cond['GT'];
            for (var key in comp) {
                return Number(entry[key]) > Number(comp[key]);
            }
        }
        if ('EQ' in cond) {
            var comp = cond['EQ'];
            for (var key in comp) {
                return Number(entry[key]) == Number(comp[key]);
            }
        }
        return true;
    };
    QueryController.prototype.filter = function (entry, content) {
        var result = {};
        for (var i in entry) {
            if (content.hasOwnProperty(i)) {
                result[i] = entry[i];
            }
        }
        return result;
    };
    return QueryController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryController;
//# sourceMappingURL=QueryController.js.map