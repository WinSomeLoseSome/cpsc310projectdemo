/**
 * Created by Benton on 18/11/2016.
 */
$(function() {

    function getBuildingName(){
        var buildingName = document.getElementById("findBuildingName").value;

        if (buildingName != ""){
            return buildingName;
        } else {
            return null;
        }
    }

    function getRoomNumber(){
        var roomNum = document.getElementById("findRoomNumber").value;

        if (roomNum != ""){
            return roomNum;
        } else {
            return null;
        }
    }

    function getRoomSizeMax(){
        var roomSize = document.getElementById("findRoomSizeMax").value;

        if (roomSize != ""){
            return roomSize;
        } else {
            return null;
        }
    }

    function getRoomSizeMin(){
        var roomSize = document.getElementById("findRoomSizeMin").value;

        if (roomSize != ""){
            return roomSize;
        } else {
            return null;
        }
    }

    function getRoomType(){
        var roomType = document.getElementById("findRoomType").value;

        if (roomType != ""){
            return roomType;
        } else {
            return null;
        }
    }

    function getMoveTables(){return document.getElementById("moveTable").checked;}

    function getMoveChairs(){return document.getElementById("moveChair").checked;}

    function getFixChairs() {return document.getElementById("fixChair").checked;}

    function getFixTables() {return document.getElementById("fixTable").checked;}

    function getFurnitureType() {
        if(getMoveTables() || getMoveChairs() || getFixTables() || getFixChairs()){

            if(getMoveTables() && !getFixChairs() && !getMoveChairs()){
                return "Classroom-Movable Tables & Chairs";
            } else if(getMoveChairs() && !getFixTables() && !getMoveTables()) {
                return "Classroom-Movable Tables & Chairs";
            } else if(getFixTables() && !getFixChairs() && !getMoveChairs()) {
                return "Classroom-Fixed Tables/Movable Chairs";
            } else if(getFixChairs() && !getFixTables() && !getMoveTables()) {
                return "Classroom-Fixed Tables/Fixed Chairs";
            } else {

                if (getMoveTables() && getMoveChairs()) {
                    return "Classroom-Movable Tables & Chairs";
                }
                if (getFixTables() && getMoveChairs()) {
                    return "Classroom-Fixed Tables/Movable Chairs";
                }
                if (getMoveTables() && getFixChairs()) {
                    window.alert("Sorry there are no rooms with movable tables and fixed chairs.");
                    return "$"; //breaks query so nothing is returned
                }
                if (getFixTables() && getFixChairs()) {
                    return "Classroom-Fixed Tables/Fixed Chairs";
                }
            }
        }
        return null;
    }

    function getLocation(){
        var loc = document.getElementById("findLocation").value;

        if (loc != ""){
            return loc;
        } else {
            return null;
        }
    }


    function makeGET() {

        var get = [];
        get.push('rooms_fullname');
        get.push('rooms_shortname');
        get.push('rooms_number');
        get.push('rooms_address');
        get.push('rooms_lat');
        get.push('rooms_lon');
        get.push('rooms_seats');
        get.push('rooms_type');
        get.push('rooms_furniture');

        return get;
    }


    function makeWHERE() {
        var is = {};
        var or  = [];
        var and = [];
        var where = {};

        if (getBuildingName() != null){
            //check to see if abreviated form was given
            if (getBuildingName().length < 6){
                is["rooms_shortname"] = getBuildingName();
            } else {
                is["rooms_fullname"] = getBuildingName()
            }
        }

        if (getRoomNumber() != null){
            is['rooms_number'] = getRoomNumber();
        }

        if (getRoomSizeMax() != null){
            and.push({"LT":{"rooms_seats":getRoomSizeMax()}});
        }

        if(getRoomSizeMin() != null){
            and.push({"GT":{"rooms_seats":getRoomSizeMin()}});
        }

        if (getRoomType() != null){
            is["rooms_type"] = getRoomType();
        }

        //figure out what kind of furniture
        if (getFurnitureType() != null){
            if (getFurnitureType() == "$"){
                return;
            } else {
                is["rooms_furniture"] = getFurnitureType();
            }
        }

        if (getLocation() != null){
            if (getBuildingName() != null){
                or.push({WITHIN: {building: getBuildingName(), distance: (Number(getLocation())/1000)}});
            } else {
                window.alert("Please enter a building to search near.");
            }
        }


        if (is != {}) {
            or.push({"IS":is});
        }
        and.push({"OR":or});
        //or.push({"AND":and});
        where['AND'] = and;
        return where;

    }

    function makeGROUP(){
        var get = makeGET();
        var group = [];

        for (var i in get){
            if(get[i].indexOf("_") !== -1){
                group.push(get[i]);
            }
        }

        return group;
    }

    function makeAPPLY() {
        apply = [];

        return apply;
    }

    function makeOrder() {

        return { "dir": "UP", "keys": ["rooms_name"]};
    }

    function buildQuery() {
        var query = {
            "GET" : makeGET(),
            "WHERE" : makeWHERE(),
            "GROUP" : makeGROUP(),
            "APPLY" : makeAPPLY(),
            "ORDER" : makeOrder(),
            "AS" : "TABLE"

        };
        return query;
    }


    function checkFields() {
        if(getMoveChairs()){
            return true;
        }
        if(getFixChairs()){
           return true;
        }
        if(getFixTables()){
            return true;
        }
        if(getMoveTables()){
            return true;
        }
        if(getBuildingName()){
            return true;
        }
        if(getRoomNumber()){
            return true;
        }
        if(getRoomSizeMax()){
            return true;
        }
        if(getRoomSizeMin()){
            return true;
        }
        if(getRoomType()){
            return true;
        }
        if(getLocation()){
            return true;
        }

        return false;
    }


    /////////////////////////////////////////functions to display info////////////////////////////////////////////////

    function display(arr){

        $("#resultTable tr").remove();
        $("#resultHead tr").remove();

        if(arr.length > 0) {
            var trHead = document.createElement("TR");
            var th1 = document.createElement("TH");
            var th2 = document.createElement("TH");
            var th3 = document.createElement("TH");
            var th4 = document.createElement("TH");
            var th5 = document.createElement("TH");
            var th6 = document.createElement("TH");


            th1.appendChild(document.createTextNode("Building"));
            th2.appendChild(document.createTextNode("Room Number"));
            th3.appendChild(document.createTextNode("Address"));
            th4.appendChild(document.createTextNode("Number of Seats"));
            th5.appendChild(document.createTextNode("Type of Room"));
            th6.appendChild(document.createTextNode("Furniture"));

            trHead.appendChild(th1);
            trHead.appendChild(th2);
            trHead.appendChild(th3);
            trHead.appendChild(th4);
            trHead.appendChild(th5);
            trHead.appendChild(th6);


            document.getElementById("resultHead").appendChild(trHead);
        }
        console.log(arr);
        for (var i =0; i<arr.length; i++){

            var tr = document.createElement("TR");
            tr.setAttribute("id", "tableTR"+i);

            var td1 = document.createElement("TD");
            //var td2 = document.createElement("TD");
            var td3 = document.createElement("TD");
            var td4 = document.createElement("TD");
            var td5 = document.createElement("TD");
            var td6 = document.createElement("TD");
            var td7 = document.createElement("TD");

            td1.appendChild(document.createTextNode(arr[i]["rooms_fullname"]));
            //td2.appendChild(document.createTextNode(arr[i]["rooms_shortname"]));
            td3.appendChild(document.createTextNode(arr[i]["rooms_number"]));
            td4.appendChild(document.createTextNode(arr[i]["rooms_address"]));
            td5.appendChild(document.createTextNode(arr[i]["rooms_seats"]));
            td6.appendChild(document.createTextNode(arr[i]["rooms_type"]));
            td7.appendChild(document.createTextNode(arr[i]["rooms_furniture"]));


            tr.appendChild(td1);
            //tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            tr.appendChild(td6);
            tr.appendChild(td7);

            document.getElementById("resultTable").appendChild(tr);

        }


        return arr.length > 0; //returns whether on not it displays anything
    }

    ////////////////////////////////////////filters for data after query has been made///////////////////////////
    function filterResult(result){
        var goodResult = [];
        var rmNum = true;
        var rmType = true;
        var rmFurn = true;
        var rmMax = true;
        var rmMin = true;
        console.log("in filter " + result);
        for(var i = 0; i < result.length; i++){
            if(getRoomNumber()!= null) {
                if(result[i]["rooms_number"] != getRoomNumber()){
                    rmNum = false;
                }
            }
            if(getRoomType()!= null) {
                if(result[i]["rooms_type"] != getRoomType()){
                    rmType = false;
                }
            }
            if(getFurnitureType()!= null) {
                if(result[i]["rooms_furniture"] != getFurnitureType()){
                    rmFurn = false;
                }
            }
            if(getRoomSizeMax()!= null) {
                if(result[i]["rooms_seats"] > getRoomSizeMax()){
                    rmMax = false;
                }
            }
            if(getRoomNumber()!= null) {
                if(result[i]["rooms_seats"] < getRoomSizeMin()){
                    rmMin = false;
                }
            }

            if(rmNum && rmType && rmFurn && rmMax && rmMin){
                goodResult.push(result[i]);
            }

            rmNum = true;
            rmType = true;
            rmFurn = true;
            rmMax = true;
            rmMin = true;


        }
        return goodResult;

    }




    $("#roomsQuerySubmit").submit(function(e) {
        e.preventDefault();
        var query = JSON.stringify(buildQuery());
        console.log(query);
        if (getLocation() == null) {
            try {
                $.ajax("/query", {
                    type: "POST",
                    data: query,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (data) {

                        if (checkFields()) {
                            display(data["result"]);
                            if (!display(data["result"])) {
                                window.alert("Sorry there are no matching results to your search");
                            }
                        } else if (!checkFields()) {
                            window.alert("Please enter information to search for into one of the fields");
                        }


                    }
                }).fail(function (e) {
                    spawnHttpErrorModal(e)
                });
            } catch (err) {
                spawnErrorModal("Query Error", err);
            }
        } else {
            try {
                $.ajax("/query", {
                    type: "POST",
                    data: query,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (data) {
                        var goodResult = filterResult(data["result"]);

                        if (checkFields()) {
                            display (goodResult);
                            if (!display(goodResult)) {
                                window.alert("Sorry there are no matching results to your search");
                            }

                        } else if (!checkFields()) {
                            window.alert("Please enter information to search for into one of the fields");
                        }


                    }
                }).fail(function (e) {
                    spawnHttpErrorModal(e)
                });
            } catch (err) {
                spawnErrorModal("Query Error", err);
            }

        }

    });


    function spawnHttpErrorModal(e) {
        $("#errorModal .modal-title").html(e.status);
        $("#errorModal .modal-body p").html(e.statusText + "</br>" + e.responseText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }

    function spawnErrorModal(errorTitle, errorText) {
        $("#errorModal .modal-title").html(errorTitle);
        $("#errorModal .modal-body p").html(errorText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }


});