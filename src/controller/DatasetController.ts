/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import fs = require('fs');
import {stringify} from "querystring";
import parse5 = require('parse5'); // parse5 for D3
import http = require('http');
import {link} from "fs";

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: any;
}

// add for D3 lat & lon
export interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class DatasetController {

    private datasets: Datasets = {};
    private nameMapping: any = {};

    constructor() {
        Log.trace('DatasetController::init()');

        // add uuid for d2
        this.nameMapping = {dept: 'Subject', id: 'Course', avg: 'Avg', instructor: 'Professor', title: 'Title',
            pass: 'Pass', fail: 'Fail', audit: 'Audit', uuid: 'id', year: 'Year'};
    }
    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */

    // check if an object is empty - returns true if object is empty
    public isEmpty(obj: Object): boolean {
        return Object.keys(obj).length === 0;
    }

    public getDatasets(): Datasets {

        let that = this;

        try {
            if (!fs.existsSync('./data/')){
                fs.mkdirSync('./data/');
            }
        } catch(err) {
            console.log(err);
            console.log("existSync error.");

        }
        if (this.isEmpty(this.datasets)) { // should check id datasets is empty
            fs.readdir('./data/', function(err, filenames){
                if (err) {
                    console.log("disk crash");
                    return that.datasets;
                }
                for (let id of filenames) {
                    if (!/^\./.test(id)) {
                        fs.readFile('./data/' + id, 'utf8', function (err, data) {
                            console.log('Loading datasets '+ id);
                            if (err) {
                                console.log("disk crash");
                                return that.datasets;
                            }
                            data = JSON.parse(data);
                            that.datasets[id] = data;
                        });
                    }
                }
            });
        }
        return this.datasets;
    }

    public deleleDataset(id: string): boolean {
        if (this.datasets.hasOwnProperty(id)) {
            delete this.datasets[id];
            return true;
        }
        return false;
    }

    public findDoc(doc: any, tagName: string, attrName: any, attrValue: any): any {
        if (this.compareDoc(doc, tagName, attrName, attrValue)) {
            return doc;
        }
        if ('childNodes' in doc) {
            for (let child of doc.childNodes) {
                let x: any = this.findDoc(child, tagName, attrName, attrValue);
                if (x != null) {
                    return x;
                }
            }
        }
        return null;
    }

    public compareDoc (doc: any, tagName: string, attrName: any, attrValue: any): boolean {
        try {
            if (doc.tagName == tagName) {
                if (attrName != null) {
                    for (let a of doc.attrs) {
                        if (a.name == attrName && a.value == attrValue) {
                            return true;
                        }
                    }
                    return false;
                }
                return true;
            }
            return false;
        } catch(err) {
            console.log("compare failed" + err);
            return false;
        }
    }

    public getLonLat (addr: string): Promise<GeoResponse> {
        return new Promise(function (fulfill, reject) {
            let newAddr = addr.replace(" ", "%20");

            http.get('http://skaha.cs.ubc.ca:8022/api/v1/team82/' + newAddr, function(res) {
                if (res.statusCode != 200) {
                  reject("Web Request Failed");
                }
                //parse the result to JSON
                res.setEncoding('utf8');
                let rowData = '';
                res.on('data', (chunk: any) => rowData += chunk);
                res.on('end', () => {
                    try {
                        let parseData: GeoResponse = JSON.parse(rowData);
                        //console.log(parseData);
                        if ('error' in parseData) {
                            reject(parseData.error);
                        }else {
                            fulfill(parseData);
                        }
                    } catch (e) {
                        reject(e);
                    }
                })
            }).on('error', function(e: any){
                reject(e);
            })
        });
    }


    public process(id: string, data: any): Promise<boolean> {
        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;
        return new Promise(function (fulfill, reject) {
            try {

                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) { //unzip
                    Log.trace('DatasetController::process(..) - unzipped');

                    // For D3 rooms
                    let processedDataset: any = [];
                    let arrayOfPromises: any[] = [];

                    function processAll() {
                        Promise.all(arrayOfPromises).then (function (){

                            //console.log(processedDataset);
                            let flag = id in that.datasets; //True: if dataset exist; Flase: new dataset.
                            that.save(id, processedDataset).then(function() {
                                fulfill(flag);
                            }).catch(function (err) {
                                reject(err);
                            });

                        }).catch(function(err) {
                            console.log('Parse Error');
                            reject(err);
                        });
                    }

                    if (id == 'rooms') {
                        zip.file("index.htm").async("string").then(function (data) {
                            let doc: any = parse5.parse(data);
                            let section = that.findDoc(doc, 'section', 'id', 'block-system-main' );
                            let tbody = that.findDoc(section, 'tbody', null, null );
                            //console.log(tbody);

                            // Inside the tb now and we can find names now!
                            for (let row of tbody.childNodes) {
                                if('tagName' in row && row.tagName == 'tr') {
                                    let shortNameNode: any = that.findDoc(row, 'td', 'class', 'views-field views-field-field-building-code');
                                    let shortName = shortNameNode.childNodes[0].value.trim();
                                    //console.log(shortName);

                                    let fullNameTD: any = that.findDoc(row, 'td', 'class', 'views-field views-field-title');
                                    let fullNameNode: any = that.findDoc(fullNameTD, 'a', 'title', 'Building Details and Map');
                                    let fullName = fullNameNode.childNodes[0].value.trim();
                                    //console.log(fullName);

                                    let addressNode: any = that.findDoc(row, 'td', 'class', 'views-field views-field-field-building-address');
                                    let address = addressNode.childNodes[0].value.trim();
                                    //console.log(address);


                                    //More info building link
                                    let a: any;
                                    for (a of fullNameNode.attrs) {
                                        if (a.name == 'href') {
                                            break;
                                        }
                                    }
                                    let link = a.value;
                                    if (/^\./.test(link)) {
                                        // Remove the "./" prefix
                                        link = link.substring(2);
                                    }
                                    //console.log(link);


                                    // enter the "More Info" page
                                    let getPromise = function(shortName: string, fullName: string, address: string) {
                                        return that.getLonLat(address).then(function(latlonresult: GeoResponse) {
                                            return zip.file(link).async("string").then(function (data: string) {
                                                console.log("enter the 'More Info' Page");
                                                let doc: any = parse5.parse(data);
                                                let section = that.findDoc(doc, 'section', 'id', 'block-system-main' );
                                                let tbody = that.findDoc(section, 'tbody', null, null );

                                                for (let row of tbody.childNodes) {
                                                    if('tagName' in row && row.tagName == 'tr') {
                                                        let roomNumNode: any =  that.findDoc(row, 'a', 'title', 'Room Details');
                                                        let roomNumber = roomNumNode.childNodes[0].value.trim();
                                                        //console.log(roomNumber + shortName);

                                                        let roomName = shortName + "_" + roomNumber;

                                                        let seatNode: any =  that.findDoc(row, 'td', 'class', 'views-field views-field-field-room-capacity');
                                                        let seat = Number(seatNode.childNodes[0].value.trim());

                                                        let furnNode: any =  that.findDoc(row, 'td', 'class', 'views-field views-field-field-room-furniture');
                                                        let furniture = furnNode.childNodes[0].value.trim();

                                                        let typeNode: any = that.findDoc(row, 'td', 'class', 'views-field views-field-field-room-type');
                                                        let roomtype = typeNode.childNodes[0].value.trim();

                                                        let hrefTD: any = that.findDoc(row, 'td', 'class', 'views-field views-field-nothing');
                                                        let hrefNode:any = that.findDoc(hrefTD, 'a', null, null);
                                                        let a: any;
                                                        for (a of hrefNode.attrs) {
                                                            if (a.name == 'href') {
                                                                break;
                                                            }
                                                        }
                                                        let href = a.value;

                                                        let room = {
                                                            [id+'_fullname']: fullName,
                                                            [id+'_shortname']: shortName,
                                                            [id+'_address']: address,
                                                            [id+'_number']: roomNumber,
                                                            [id+'_lat']: latlonresult.lat,
                                                            [id+'_lon']: latlonresult.lon,
                                                            [id+'_name']: roomName,
                                                            [id+'_seats']: seat,
                                                            [id+'_type']: roomtype,
                                                            [id+'_furniture']: furniture,
                                                            [id+'_href']: href,
                                                        }
                                                        //console.log(room);
                                                        processedDataset.push(room);
                                                    }
                                                }
                                        })}).catch(function(err: any) {
                                            console.log(err);
                                            console.log(shortName);
                                        });
                                    };
                                    arrayOfPromises.push(getPromise(shortName, fullName, address));

                                }
                            }

                        }).then(processAll).catch(function (err) {
                            console.log("error" + err);
                            reject(err);
                        });

                    }
                    else { // file is JSON (i.e. courses or others)
                        zip.forEach(function (relativePath, file) {
                            var promise = file.async("string").then(function success(content) {

                                let myContent: any;

                                // 1. check not empty 2. check if the relativepath start with __ 3.check if start with .(hidden file)
                                if (content.length > 3 && !/^__/.test(relativePath) && !/^\./.test(relativePath)) {
                                    try { //check upzipped file to see if iy has valid JSON content.
                                        myContent = JSON.parse(content);
                                        //console.log(content);
                                    } catch (err) {
                                        //console.log(content);
                                        console.log(relativePath);
                                        console.log("xxxx" + err);
                                        throw err;
                                    }
                                    if (myContent != undefined && myContent.result == undefined) {
                                        console.log('Valid json but missing results');
                                        throw {message: 'Invalid dataset'};
                                    }
                                    if (myContent != undefined) {
                                        for (let courseinfo of myContent.result) {
                                           let c: any = that.filter(courseinfo, that.nameMapping, id);
                                            if (courseinfo['Section'] == 'overall') {
                                                c[id+"_year"] = 1900;
                                            }
                                            processedDataset.push(c);
                                            //console.log("push");
                                        }
                                    } else {
                                        console.log('undefined parsed content!');
                                    }
                                }

                            });
                            arrayOfPromises.push(promise);

                        });
                        processAll();
                        //console.log(processedDataset);
                    }

                    //Promise.all catch
                }).catch(function (err) {
                    console.log("ABCDDDDD" + err);
                    reject(err);
                });

                //try catch
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                console.log(err);
                reject(err);
            }
        });
    }

    //
    private filter(entry: any, filterKeys: any, id: string): Object {
        let result: any = {};
        for (let i in filterKeys) {
            if (entry.hasOwnProperty(filterKeys[i])) {
                result[id + '_' + i] = entry[filterKeys[i]];
            }
        }
        return result;
    }

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string, processedDataset: any): Promise<any> {
        // add it to the memory model
        this.datasets[id] = processedDataset; //save content in memory.
        //console.log('save on memory!');

        return new Promise(function(fulfill, reject) {
            fs.writeFile('./data/' + id, JSON.stringify(processedDataset), function(err) {
                if(err) {
                    console.log(err);
                    reject(err);
                }
                console.log('Saved on disk!');
                fulfill(1);
            });
        });
    }
}
