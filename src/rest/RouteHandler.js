"use strict";
var fs = require('fs');
var Util_1 = require('../Util');
var InsightFacade_1 = require("../controller/InsightFacade");
var RouteHandler = (function () {
    function RouteHandler() {
    }
    RouteHandler.getHomepage = function (req, res, next) {
        Util_1.default.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    };
    RouteHandler.getSchedule = function (req, res, next) {
        Util_1.default.trace('RoutHandler::getSchedule(..)');
        fs.readFile('./src/rest/views/schedule.html', 'utf8', function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    };
    RouteHandler.getRoomsQuery = function (req, res, next) {
        Util_1.default.trace('RoutHandler::getRoomsQuery(..)');
        fs.readFile('./src/rest/views/roomsQuery.html', 'utf8', function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    };
    RouteHandler.getUploadDataset = function (req, res, next) {
        Util_1.default.trace('RoutHandler::getUploadDataset(..)');
        fs.readFile('./src/rest/views/uploadDataset.html', 'utf8', function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    };
    RouteHandler.getCoursesQuery = function (req, res, next) {
        Util_1.default.trace('RoutHandler::getCourseQuery(..)');
        fs.readFile('./src/rest/views/coursesQuery.html', 'utf8', function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    };
    RouteHandler.putDataset = function (req, res, next) {
        Util_1.default.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id = req.params.id;
            var buffer_1 = [];
            req.on('data', function onRequestData(chunk) {
                Util_1.default.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer_1.push(chunk);
            });
            req.once('end', function () {
                var concated = Buffer.concat(buffer_1);
                req.body = concated.toString('base64');
                Util_1.default.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);
                RouteHandler.facade.addDataset(id, req.body).then(function (result) {
                    res.json(result.code, result.body);
                }).catch(function (result) {
                    res.json(result.code, result.body);
                });
            });
        }
        catch (err) {
            Util_1.default.error('RouteHandler::postDataset(..) - ERROR_B: ' + err.message);
            res.send(400, { error: err.message });
        }
        return next();
    };
    RouteHandler.postQuery = function (req, res, next) {
        Util_1.default.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        RouteHandler.facade.performQuery(req.params).then(function (result) {
            res.json(result.code, result.body);
        }).catch(function (result) {
            console.log('in RouteHandler: ', result);
            console.log(JSON.stringify(result.body));
            console.log(result.code);
            res.send(Number(result.code), JSON.stringify(result.body));
        });
        return next();
    };
    RouteHandler.scheduleQuery = function (req, res, next) {
        Util_1.default.trace('RouteHandler::scheduleQuery(..) - params: ' + JSON.stringify(req.params));
        var result = RouteHandler.facade.schedule(req.params);
        res.json(result.code, result.body);
        return next();
    };
    RouteHandler.delete = function (req, res, next) {
        Util_1.default.trace('RouteHandler::delete(..) - params: ' + JSON.stringify(req.params));
        var id = req.params.id;
        RouteHandler.facade.removeDataset(id).then(function (result) {
            res.json(result.code, result.body);
        }).catch(function (result) {
            res.json(result.code, result.body);
        });
        return next();
    };
    RouteHandler.facade = new InsightFacade_1.default();
    return RouteHandler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RouteHandler;
//# sourceMappingURL=RouteHandler.js.map