/**
 * Created by Benton on 16/11/2016.
 */

$(function() {

    //////////////////////////////////////// Getters - below///////////////////////////////////////////////////////////

    //for WHERE- below
    function getSectionSize() {
        var sectionSize = document.getElementById("findSectionSize").value;
        var sSIsNum = /^\d+$/.test(sectionSize);
        if (sectionSize != "") {
            if (sSIsNum) {
                return sectionSize;
            } else {
                window.alert ("Section Size must be a number");
                return null;
            }
        } else {
            return null;
        }
    }

    function getDepartment() {
        var department = document.getElementById("findDepartment").value.toLowerCase();
        var dIsLetters = /^[a-zA-Z\s]+$/.test(department);
        if (department != "") {
            if (dIsLetters) {
                return department;
            } else {
                window.alert ("Department names must only contain letters and spaces.");
                return null;
            }
        } else {
            return null;
        }
    }

    function getcourseNumber() {
        var courseNumber = document.getElementById("findCourseNumber").value;
        var cNIsNum = /^[\d]+$/.test(courseNumber);
        if (courseNumber != "") {
            if(cNIsNum) {
                return courseNumber;
            } else {
                window.alert ("Course Number must be a number");
                return null;
            }
        } else {
            return null;
        }
    }
    //not used
    function multipleInstructors(str){
        var iIsNames = /^[,a-zA-Z\s]+$/.test(str);

        if (str.indexOf(",") != -1) {
            var strArr = str.split(",");
            for (var i = 0; i < strArr.length; i++){
                strArr[i].replace(",", "");
                if (strArr[i].charAt(0) == " "){

                }
            }
        }
    }

    function reOrderName(str){
        if (str != "") {
            var iIsLetters = /^[a-zA-Z\s]+$/.test(str);
            if (iIsLetters) {
                var nameArr = str.split(" ");
                if (nameArr.length > 2) {
                    window.alert("Please only provide the instructors first and last name");
                    return null;
                } else {
                    var name = nameArr[1] + ", " + nameArr[0];

                    return name;
                }
            } else {
                window.alert("The Instructor's name must only contain letters and spaces.");
                return null;
            }
        }
    }

    function getInstructor() {
        var instructor = reOrderName(document.getElementById("findInstructor").value.toLowerCase());
        if (instructor != "") {
            return instructor;
        } else {
            return null;
        }
    }

    function getCourseTitle() {
        var courseTitle = document.getElementById("findCourseTitle").value.toLowerCase();
        var cTIsLetters = /^[,a-zA-Z\s]+$/.test(courseTitle);
        if (courseTitle) {
            if (cTIsLetters) {
                return courseTitle;
            } else {
                window.alert("The course Title must only be numbers and letters");
                return null;
            }
        } else {
            return null;
        }
    }

    function isHighAvg(){
        return document.getElementById("ha-check").checked;
    }

    function isLowAvg(){
        return document.getElementById("la-check").checked;
    }

    function isMostSection(){
        return document.getElementById("ms-check").checked;
    }

    function isMostFail(){
        return document.getElementById("mf-check").checked;
    }

    function isMostPass(){
        return document.getElementById("mp-check").checked;
    }

    function isCourses() {
        return document.getElementById("courseSwitch").checked;
    }

    function isSection() {
        return document.getElementById("sectionSwitch").checked;
    }

    //////////////////////////////////////////// Functions to make Query///////////////////////////////////////////////


    function makeGET() {

        var get = [];
        get.push('courses_pass');
        get.push('courses_fail');
        get.push('courses_dept');
        get.push('courses_id');
        get.push('courses_title');
        get.push('courses_instructor');
        get.push("courses_avg");

        if (isHighAvg()) {
            get.push("maxAverage");
        }

        if (isLowAvg()) {
            get.push("minAverage");
        }

        if (isMostSection()){
            get.push("numSections");
        }

        if(isMostFail()) {
            get.push("maxFail");
        }

        if(isMostPass()){
            get.push("maxPass");
        }


        return get;
    }

    function makeWHERE() {

        var where ={}
        var is = {};

        var department = getDepartment();
        if (department != null){
            is['courses_dept'] = department;
        }
        var courseNum = getcourseNumber();
        if (courseNum != null){
            is['courses_id'] = courseNum;
        }
        var courseTitle = getCourseTitle();
        if (courseTitle != null){
            is['courses_title'] = courseTitle;
        }
        var instructor = getInstructor();
        if (instructor != null){
            is['courses_instructor'] = instructor;
        }

        where['IS'] = is;

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

    function makeAPPLY(){
        var get = makeGET();
        var apply = [];

        for (var i in get) {
            //checks if element in get does not have "_"
            if(get[i].indexOf("_") == -1){
                if(get[i] == "minAverage") {
                    apply.push({"minAverage": {"MIN": "courses_avg"}});
                }

                if(get[i] == "maxAverage") {
                    apply.push({"maxAverage": {"MAX": "courses_avg"}});
                }

                if(get[i] == "numSections") {
                    apply.push({"numSections": {"COUNT": "courses_uuid"}});
                }

                if(get[i] == "maxPass") {
                    apply.push({"maxPass": {"MAX": "courses_pass"}});
                }

                if(get[i] == "maxFail") {
                    apply.push({"maxFail": {"MAX": "courses_fail"}});
                }
            }
        }

        return apply;
    }

    function makeOrder() {
        var get = makeGET();
        var keys = [];
        for(var i = 0; i <get.length; i++){
            if(get[i].indexOf("_") == -1){
                keys.push(get[i]);
            }
        }
        if (keys.length > 0 && keys.includes("minAverage")){
            return { "dir": "UP", "keys": keys};
        } else if (keys.length > 0){
            return { "dir": "DOWN", "keys": keys};
        } else {
            return "courses_title";
        }
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
    ////////////////////////////////////Query validation///////////////////////////////////////////////////////////////

    function checkFields() {
        var fields = [];
        fields.push(getcourseNumber());
        fields.push(getCourseTitle());
        fields.push(getDepartment());
        fields.push(getInstructor());
        fields.push(getSectionSize());

        for (var i = 0; i < fields.length; i++) {
            if (fields[i] != null){
                return true;
            }
        }

        return false;

    }

    /////////////////////////////////Functions for after getting data back from server/////////////////////////////////

    function filterSectionSize(arr) { //arr is array - pass data{"result"] in #querysubmit function
        var goodArr = [];
        if (getSectionSize() != null) {
            for (var i = 0; i < arr.length; i++) {
                var actualSize = arr[i]["courses_pass"] + arr[i]["courses_fail"];
                var wantedSize = Number(getSectionSize());
                //the size of the section is what is wanted add a section size element else delete the element
                if (actualSize < wantedSize) {
                    arr[i]["section_size"] = actualSize;
                    goodArr.push(arr[i]);

                }
            }
        } else {
            for (var i = 0; i < arr.length; i++) {
                var actualSize = arr[i]["courses_pass"] + arr[i]["courses_fail"];
                arr[i]["section_size"] = actualSize;
            }
            return arr;
        }

        return goodArr; //returns the array with sectionSize added and elements with sectionSize too small deleted
    }

    //makes it so courses are shown not sections
    function makeUnique(array) {
            var len = array.length;
            for(var i = 0; i < len; i++) for(var j = i + 1; j < len; j++)
                if(array[j]["courses_title"] == array[i]["courses_title"]){
                    array.splice(j,1);
                    j--;
                    len--;
                }
            return array;
    }

    function limitOutput(num, arr){
        if (arr.length < 1) { //make sure there is at least one course that matches given search
            window.alert("Sorry the course or instructor you are looking for doesn't exist");
        } else if (arr.length > num) { //print first 50 results if there are more than 50 results
            var smallerResult = [];
            for (var i = 0; i < num; i++) { //makes smaller array with first 50 search results
                smallerResult.push(arr[i]);
            }

           return smallerResult;

        } else {
            return arr;
        }
    }

    function display(array) {

        var arr = limitOutput(51, array);
        $("#result tr").remove();
        $("#resultCoursesHead tr").remove();

        if(arr.length > 0) {
            var trHead = document.createElement("TR");
            var th1 = document.createElement("TH");
            var th2 = document.createElement("TH");
            var th3 = document.createElement("TH");
            var th4 = document.createElement("TH");
            var th5 = document.createElement("TH");
            var th6 = document.createElement("TH");
            var th7 = document.createElement("TH");
            var th8 = document.createElement("TH");


            th1.appendChild(document.createTextNode("Department"));
            th2.appendChild(document.createTextNode("Course Number"));
            th3.appendChild(document.createTextNode("Title"));
            th4.appendChild(document.createTextNode("Professor"));
            th5.appendChild(document.createTextNode("Average Grade"));
            th6.appendChild(document.createTextNode("Passes"));
            th7.appendChild(document.createTextNode("Fails"));
            th8.appendChild(document.createTextNode("Section Size"));


            trHead.appendChild(th1);
            trHead.appendChild(th2);
            trHead.appendChild(th3);
            trHead.appendChild(th4);
            trHead.appendChild(th5);
            trHead.appendChild(th6);
            trHead.appendChild(th7);
            trHead.appendChild(th8);


            document.getElementById("resultCoursesHead").appendChild(trHead);
        }

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
            var td8 = document.createElement("TD");
            var td9 = document.createElement("TD");

            td1.appendChild(document.createTextNode(arr[i]["courses_dept"].toUpperCase()));
            //td2.appendChild(document.createTextNode(arr[i]["rooms_shortname"]));
            td3.appendChild(document.createTextNode(arr[i]["courses_id"]));
            td4.appendChild(document.createTextNode(arr[i]["courses_title"]));
            td5.appendChild(document.createTextNode(arr[i]["courses_instructor"]));
            td6.appendChild(document.createTextNode(arr[i]["courses_avg"]));
            td7.appendChild(document.createTextNode(arr[i]["courses_pass"]));
            td8.appendChild(document.createTextNode(arr[i]["courses_fail"]));
            td9.appendChild(document.createTextNode(arr[i]["section_size"]));


            tr.appendChild(td1);
            //tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            tr.appendChild(td6);
            tr.appendChild(td7);
            tr.appendChild(td8);
            tr.appendChild(td9);

            document.getElementById("result").appendChild(tr);

        }


        return arr.length > 0; //returns whether on not it displays anything

    }

    //////////////////////////////////////Functions for submitting query and receiving result///////////////////////////

    $("#testButton").click(function(){
        if (checkFields()) {
            window.alert(JSON.stringify(buildQuery()));
        } else {
            window.alert("Please enter correct information into one of the fields to search for");
        }
    });


    $("#querySubmit").submit(function(e) {

        e.preventDefault();
        var query = JSON.stringify(buildQuery());
        console.log(query);
        try {
            $.ajax("/query", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {

                if (!checkFields()){
                window.alert("Please enter correct information into one of the fields to search for.");
                } else {
                if (data["result"].length < 1) { //make sure there is at least one course that matches given search
                    window.alert("Sorry the course or instructor you are looking for doesn't exist.");

                } else {

                    var results = filterSectionSize(data["result"]);
                    if (isCourses()) {
                        display(makeUnique(results))
                    } else {
                        display(results);
                    }

                    if (data["render"] === "TABLE") {
                        generateTable(results);
                    }
                }
            }

            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });

    function generateTable(data) {
        var columns = [];
        Object.keys(data[0]).forEach(function (title) {
            columns.push({
                head: title,
                cl: "title",
                html: function (d) {
                    return d[title]
                }
            });
        });
        var container = d3.select("#render");
        container.html("");
        container.selectAll("*").remove();
        var table = container.append("table").style("margin", "auto");

        table.append("thead").append("tr")
            .selectAll("th")
            .data(columns).enter()
            .append("th")
            .attr("class", function (d) {
                return d["cl"]
            })
            .text(function (d) {
                return d["head"]
            });

        table.append("tbody")
            .selectAll("tr")
            .data(data).enter()
            .append("tr")
            .selectAll("td")
            .data(function (row, i) {
                return columns.map(function (c) {
                    // compute cell values for this specific row
                    var cell = {};
                    d3.keys(c).forEach(function (k) {
                        cell[k] = typeof c[k] == "function" ? c[k](row, i) : c[k];
                    });
                    return cell;
                });
            }).enter()
            .append("td")
            .html(function (d) {
                return d["html"]
            })
            .attr("class", function (d) {
                return d["cl"]
            });
    }

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