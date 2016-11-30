"use strict";
var Util_1 = require("../Util");
var JSZip = require('jszip');
var fs = require('fs');
var parse5 = require('parse5');
var http = require('http');
var DatasetController = (function () {
    function DatasetController() {
        this.datasets = {};
        this.nameMapping = {};
        Util_1.default.trace('DatasetController::init()');
        this.nameMapping = { dept: 'Subject', id: 'Course', avg: 'Avg', instructor: 'Professor', title: 'Title',
            pass: 'Pass', fail: 'Fail', audit: 'Audit', uuid: 'id', year: 'Year' };
    }
    DatasetController.prototype.isEmpty = function (obj) {
        return Object.keys(obj).length === 0;
    };
    DatasetController.prototype.getDatasets = function () {
        var that = this;
        try {
            if (!fs.existsSync('./data/')) {
                fs.mkdirSync('./data/');
            }
        }
        catch (err) {
            console.log(err);
            console.log("existSync error.");
        }
        if (this.isEmpty(this.datasets)) {
            fs.readdir('./data/', function (err, filenames) {
                if (err) {
                    console.log("disk crash");
                    return that.datasets;
                }
                var _loop_1 = function(id) {
                    if (!/^\./.test(id)) {
                        fs.readFile('./data/' + id, 'utf8', function (err, data) {
                            console.log('Loading datasets ' + id);
                            if (err) {
                                console.log("disk crash");
                                return that.datasets;
                            }
                            data = JSON.parse(data);
                            that.datasets[id] = data;
                        });
                    }
                };
                for (var _i = 0, filenames_1 = filenames; _i < filenames_1.length; _i++) {
                    var id = filenames_1[_i];
                    _loop_1(id);
                }
            });
        }
        return this.datasets;
    };
    DatasetController.prototype.deleleDataset = function (id) {
        if (this.datasets.hasOwnProperty(id)) {
            delete this.datasets[id];
            return true;
        }
        return false;
    };
    DatasetController.prototype.findDoc = function (doc, tagName, attrName, attrValue) {
        if (this.compareDoc(doc, tagName, attrName, attrValue)) {
            return doc;
        }
        if ('childNodes' in doc) {
            for (var _i = 0, _a = doc.childNodes; _i < _a.length; _i++) {
                var child = _a[_i];
                var x = this.findDoc(child, tagName, attrName, attrValue);
                if (x != null) {
                    return x;
                }
            }
        }
        return null;
    };
    DatasetController.prototype.compareDoc = function (doc, tagName, attrName, attrValue) {
        try {
            if (doc.tagName == tagName) {
                if (attrName != null) {
                    for (var _i = 0, _a = doc.attrs; _i < _a.length; _i++) {
                        var a = _a[_i];
                        if (a.name == attrName && a.value == attrValue) {
                            return true;
                        }
                    }
                    return false;
                }
                return true;
            }
            return false;
        }
        catch (err) {
            console.log("compare failed" + err);
            return false;
        }
    };
    DatasetController.prototype.getLonLat = function (addr) {
        return new Promise(function (fulfill, reject) {
            var newAddr = addr.replace(" ", "%20");
            http.get('http://skaha.cs.ubc.ca:8022/api/v1/team82/' + newAddr, function (res) {
                if (res.statusCode != 200) {
                    reject("Web Request Failed");
                }
                res.setEncoding('utf8');
                var rowData = '';
                res.on('data', function (chunk) { return rowData += chunk; });
                res.on('end', function () {
                    try {
                        var parseData = JSON.parse(rowData);
                        if ('error' in parseData) {
                            reject(parseData.error);
                        }
                        else {
                            fulfill(parseData);
                        }
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }).on('error', function (e) {
                reject(e);
            });
        });
    };
    DatasetController.prototype.process = function (id, data) {
        Util_1.default.trace('DatasetController::process( ' + id + '... )');
        var that = this;
        return new Promise(function (fulfill, reject) {
            try {
                var myZip = new JSZip();
                myZip.loadAsync(data, { base64: true }).then(function (zip) {
                    Util_1.default.trace('DatasetController::process(..) - unzipped');
                    var processedDataset = [];
                    var arrayOfPromises = [];
                    function processAll() {
                        Promise.all(arrayOfPromises).then(function () {
                            var flag = id in that.datasets;
                            that.save(id, processedDataset).then(function () {
                                fulfill(flag);
                            }).catch(function (err) {
                                reject(err);
                            });
                        }).catch(function (err) {
                            console.log('Parse Error');
                            reject(err);
                        });
                    }
                    if (id == 'rooms') {
                        zip.file("index.htm").async("string").then(function (data) {
                            var doc = parse5.parse(data);
                            var section = that.findDoc(doc, 'section', 'id', 'block-system-main');
                            var tbody = that.findDoc(section, 'tbody', null, null);
                            var _loop_2 = function(row) {
                                if ('tagName' in row && row.tagName == 'tr') {
                                    var shortNameNode = that.findDoc(row, 'td', 'class', 'views-field views-field-field-building-code');
                                    var shortName = shortNameNode.childNodes[0].value.trim();
                                    var fullNameTD = that.findDoc(row, 'td', 'class', 'views-field views-field-title');
                                    var fullNameNode = that.findDoc(fullNameTD, 'a', 'title', 'Building Details and Map');
                                    var fullName = fullNameNode.childNodes[0].value.trim();
                                    var addressNode = that.findDoc(row, 'td', 'class', 'views-field views-field-field-building-address');
                                    var address = addressNode.childNodes[0].value.trim();
                                    var a = void 0;
                                    for (var _i = 0, _a = fullNameNode.attrs; _i < _a.length; _i++) {
                                        a = _a[_i];
                                        if (a.name == 'href') {
                                            break;
                                        }
                                    }
                                    var link_1 = a.value;
                                    if (/^\./.test(link_1)) {
                                        link_1 = link_1.substring(2);
                                    }
                                    var getPromise = function (shortName, fullName, address) {
                                        return that.getLonLat(address).then(function (latlonresult) {
                                            return zip.file(link_1).async("string").then(function (data) {
                                                console.log("enter the 'More Info' Page");
                                                var doc = parse5.parse(data);
                                                var section = that.findDoc(doc, 'section', 'id', 'block-system-main');
                                                var tbody = that.findDoc(section, 'tbody', null, null);
                                                for (var _i = 0, _a = tbody.childNodes; _i < _a.length; _i++) {
                                                    var row_1 = _a[_i];
                                                    if ('tagName' in row_1 && row_1.tagName == 'tr') {
                                                        var roomNumNode = that.findDoc(row_1, 'a', 'title', 'Room Details');
                                                        var roomNumber = roomNumNode.childNodes[0].value.trim();
                                                        var roomName = shortName + "_" + roomNumber;
                                                        var seatNode = that.findDoc(row_1, 'td', 'class', 'views-field views-field-field-room-capacity');
                                                        var seat = Number(seatNode.childNodes[0].value.trim());
                                                        var furnNode = that.findDoc(row_1, 'td', 'class', 'views-field views-field-field-room-furniture');
                                                        var furniture = furnNode.childNodes[0].value.trim();
                                                        var typeNode = that.findDoc(row_1, 'td', 'class', 'views-field views-field-field-room-type');
                                                        var roomtype = typeNode.childNodes[0].value.trim();
                                                        var hrefTD = that.findDoc(row_1, 'td', 'class', 'views-field views-field-nothing');
                                                        var hrefNode = that.findDoc(hrefTD, 'a', null, null);
                                                        var a_1 = void 0;
                                                        for (var _b = 0, _c = hrefNode.attrs; _b < _c.length; _b++) {
                                                            a_1 = _c[_b];
                                                            if (a_1.name == 'href') {
                                                                break;
                                                            }
                                                        }
                                                        var href = a_1.value;
                                                        var room = (_d = {},
                                                            _d[id + '_fullname'] = fullName,
                                                            _d[id + '_shortname'] = shortName,
                                                            _d[id + '_address'] = address,
                                                            _d[id + '_number'] = roomNumber,
                                                            _d[id + '_lat'] = latlonresult.lat,
                                                            _d[id + '_lon'] = latlonresult.lon,
                                                            _d[id + '_name'] = roomName,
                                                            _d[id + '_seats'] = seat,
                                                            _d[id + '_type'] = roomtype,
                                                            _d[id + '_furniture'] = furniture,
                                                            _d[id + '_href'] = href,
                                                            _d
                                                        );
                                                        processedDataset.push(room);
                                                    }
                                                }
                                                var _d;
                                            });
                                        }).catch(function (err) {
                                            console.log(err);
                                            console.log(shortName);
                                        });
                                    };
                                    arrayOfPromises.push(getPromise(shortName, fullName, address));
                                }
                            };
                            for (var _b = 0, _c = tbody.childNodes; _b < _c.length; _b++) {
                                var row = _c[_b];
                                _loop_2(row);
                            }
                        }).then(processAll).catch(function (err) {
                            console.log("error" + err);
                            reject(err);
                        });
                    }
                    else {
                        zip.forEach(function (relativePath, file) {
                            var promise = file.async("string").then(function success(content) {
                                var myContent;
                                if (content.length > 3 && !/^__/.test(relativePath) && !/^\./.test(relativePath)) {
                                    try {
                                        myContent = JSON.parse(content);
                                    }
                                    catch (err) {
                                        console.log(relativePath);
                                        console.log("xxxx" + err);
                                        throw err;
                                    }
                                    if (myContent != undefined && myContent.result == undefined) {
                                        console.log('Valid json but missing results');
                                        throw { message: 'Invalid dataset' };
                                    }
                                    if (myContent != undefined) {
                                        for (var _i = 0, _a = myContent.result; _i < _a.length; _i++) {
                                            var courseinfo = _a[_i];
                                            var c = that.filter(courseinfo, that.nameMapping, id);
                                            if (courseinfo['Section'] == 'overall') {
                                                c[id + "_year"] = 1900;
                                            }
                                            processedDataset.push(c);
                                        }
                                    }
                                    else {
                                        console.log('undefined parsed content!');
                                    }
                                }
                            });
                            arrayOfPromises.push(promise);
                        });
                        processAll();
                    }
                }).catch(function (err) {
                    console.log("ABCDDDDD" + err);
                    reject(err);
                });
            }
            catch (err) {
                Util_1.default.trace('DatasetController::process(..) - ERROR: ' + err);
                console.log(err);
                reject(err);
            }
        });
    };
    DatasetController.prototype.filter = function (entry, filterKeys, id) {
        var result = {};
        for (var i in filterKeys) {
            if (entry.hasOwnProperty(filterKeys[i])) {
                result[id + '_' + i] = entry[filterKeys[i]];
            }
        }
        return result;
    };
    DatasetController.prototype.save = function (id, processedDataset) {
        this.datasets[id] = processedDataset;
        return new Promise(function (fulfill, reject) {
            fs.writeFile('./data/' + id, JSON.stringify(processedDataset), function (err) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                console.log('Saved on disk!');
                fulfill(1);
            });
        });
    };
    return DatasetController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DatasetController;
//# sourceMappingURL=DatasetController.js.map