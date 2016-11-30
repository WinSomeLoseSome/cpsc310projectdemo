/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import Log from '../Util';
import InsightFacade from "../controller/InsightFacade";

export default class RouteHandler {

    //private static datasetController = new DatasetController();
    private static facade = new InsightFacade();

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }
    public static getSchedule(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getSchedule(..)');
        fs.readFile('./src/rest/views/schedule.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }
    public static getRoomsQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getRoomsQuery(..)');
        fs.readFile('./src/rest/views/roomsQuery.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }
    public static getUploadDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getUploadDataset(..)');
        fs.readFile('./src/rest/views/uploadDataset.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }
    public static getCoursesQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getCourseQuery(..)');
        fs.readFile('./src/rest/views/coursesQuery.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);

                RouteHandler.facade.addDataset(id, req.body).then(function (result){
                    res.json(result.code, result.body);
                }).catch(function (result) {
                    res.json(result.code, result.body);
                })
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR_B: ' + err.message);
            res.send(400, {error: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));

        //let query: QueryRequest = req.params;
        RouteHandler.facade.performQuery(req.params).then(function(result){
            res.json(result.code, result.body);
        }).catch(function(result){
            console.log('in RouteHandler: ', result);
            console.log(JSON.stringify(result.body));
            console.log(result.code);
            res.send(Number(result.code), JSON.stringify(result.body));
        });

        return next();
    }

    public static scheduleQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::scheduleQuery(..) - params: ' + JSON.stringify(req.params));

        //let query: QueryRequest = req.params;
        let result = RouteHandler.facade.schedule(req.params);
        res.json(result.code, result.body);


        return next();
    }

    public static delete(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace ('RouteHandler::delete(..) - params: ' + JSON.stringify(req.params));

        let id = req.params.id;

        //delete both copies.

        //RouteHandler.datasetController.deleleDataset(id);
        RouteHandler.facade.removeDataset(id).then(function(result){
            res.json(result.code, result.body);
        }).catch(function(result){
            res.json(result.code, result.body);
        });

        return next();
    }

}
