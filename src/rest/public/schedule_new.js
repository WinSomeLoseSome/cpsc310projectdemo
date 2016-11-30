/**
 * Created by Benton on 26/11/2016.
 */
$(function() {

    function getBuildingName(){
        var buildingName = document.getElementById("schedBuildingName").value;
        var bDIsLetters = /^[a-zA-Z\s]+$/.test(buildingName);
        if (buildingName != ""){
            if(bDIsLetters) {
                return buildingName;
            } else {
                window.alert("Building name must only contain letters and spaces.");
                return null;
            }
        } else {
            return null;
        }
    }

    function getLocation(){
        var loc = document.getElementById("schedLocation").value;
        var lIsNum = /^[\d]+$/.test(loc);
        if (loc != ""){
            if(lIsNum) {
                return loc;
            } else {
                window.alert("Distance must be a number.");
                return null;
            }

        } else {
            return null;
        }
    }

    function getDepartment() {
        var department = document.getElementById("schedDepartment").value.toLowerCase();
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
        var courseNumber = document.getElementById("schedCourseNumber").value;
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

    function makeRoomWHERE(){
        var or = [];
        if(getBuildingName() == null){
            window.alert("Please enter a building to schedule in or near.");
        } else {
            or.push({"IS":{"rooms_fullname": getBuildingName()}});
            if (getLocation() != null){
                or.push({"WITHIN":{"building":getBuildingName(), "distance":getLocation()}});
            }
        }
        return {"OR": or};
    }

    function makeRoomsQuery(){
        var query = {
            "GET": ['rooms_name', "rooms_fullname"],
            "WHERE": makeRoomWHERE(),
            "AS": 'TABLE'
        }

        return query;
    }

    function makeCourseWHERE(){
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
        where['IS'] = is;

        return where;
    }


    function makeCourseQuery(){
        var query = {
            "GET": ['courses_uuid', 'courses_dept', 'courses_id', 'courses_year'],
            "WHERE": makeCourseWHERE(),
            "GROUP": ['courses_uuid', 'courses_dept', 'courses_id', 'courses_year'],
            "APPLY": [],
            "ORDER": "courses_dept",
            "AS": "TABLE"
        };
        return query;
    }

    function ifAnySched(courseName){
        var bool = false;
             for (var day in courseName) {
                 for (var i in courseName[day]){
                    if (courseName[day][i] != null){
                        bool = true;
                    }
                 }
             }
         return bool; //change - just to test
    }


    function displaySchedule(obj){

        $("#showSched table").remove();
        $("#showSched p").remove();
        $("#showSched br").remove();

            for (var courseName in obj) {
                //////builds headers for each time table///////
                if (ifAnySched(obj[courseName])){
                var br = document.createElement("BR");
                document.getElementById("showSched").appendChild(br);

                var tableTitle = courseName.split("_").join(' ');
                var p = document.createElement("P");
                p.setAttribute('class', 'lead');
                p.appendChild(document.createTextNode(tableTitle));
                document.getElementById("showSched").appendChild(p);

                var times = document.createElement("TABLE");
                times.setAttribute('class', 'side-by-side');
                var timesHead = document.createElement("THEAD");


                var timestrHead = document.createElement("TR");
                var timesth = document.createElement("TH");
                timesth.appendChild(document.createTextNode("Time"));
                timestrHead.appendChild(timesth);
                timesHead.appendChild(timestrHead);
                times.appendChild(timesHead);


                var timesbody = document.createElement("TBODY");
                var time = 800;

                for (var t = 0; t < 18; t++) {

                    if (time % 100 == 60) {
                        time += 40;
                    }

                    var ttr = document.createElement('TR');
                    var ttd = document.createElement('TD');
                    ttd.appendChild(document.createTextNode(time.toString()));
                    ttr.appendChild(ttd);
                    timesbody.appendChild(ttr);
                    time += 30;

                }


                times.appendChild(timesbody);

                document.getElementById("showSched").appendChild(times);


                for (var day in obj[courseName]) {

                    var table = document.createElement("TABLE");
                    table.setAttribute('class', 'side-by-side');
                    var thead = document.createElement("THEAD");
                    var trHead = document.createElement("TR");

                    var tbody = document.createElement("TBODY");

                    var th = document.createElement("TH");
                    th.appendChild(document.createTextNode(day.toUpperCase()));
                    trHead.appendChild(th);
                    //console.log(day);

                    for (var i in obj[courseName][day]) {
                        var td1Day = document.createElement("TD");
                        var td2Day = document.createElement("TD");
                        var td3Day = document.createElement("TD");
                        // if the course is null fill space with empty else print course in space
                        if (obj[courseName][day][i] != "null") {
                            td1Day.appendChild(document.createTextNode(obj[courseName][day][i]));
                            td2Day.appendChild(document.createTextNode(obj[courseName][day][i]));
                            td3Day.appendChild(document.createTextNode(obj[courseName][day][i]));
                        } else {
                            td1Day.appendChild(document.createElement("Empty"));
                            td2Day.appendChild(document.createElement("Empty"));
                            td3Day.appendChild(document.createElement("Empty"));
                        }

                        var tr1Day = document.createElement("TR");
                        var tr2Day = document.createElement("TR");
                        var tr3Day = document.createElement("TR");
                        tr1Day.appendChild(td1Day);
                        tr2Day.appendChild(td2Day);
                        tr3Day.appendChild(td3Day);

                        //push two half our time space
                        if (day == "mon" || day == "wed" || day == "fri") {
                            tbody.appendChild(tr1Day);
                            tbody.appendChild(tr2Day);

                        }
                        //push three half hour time places
                        if (day == "tue" || day == "thu") {
                            tbody.appendChild(tr1Day);
                            tbody.appendChild(tr2Day);
                            tbody.appendChild(tr3Day);
                        }
                    }


                    thead.appendChild(trHead);
                    table.appendChild(thead);
                    table.appendChild(tbody);
                    document.getElementById("showSched").appendChild(table);

                }
            }
        }
    }



    $("#scheduleQuery").submit(function(e){
       e.preventDefault();
       console.log("Pressed");
        var roomQuery = JSON.stringify(makeRoomsQuery());
        var roomData = [];
        var courseQuery = JSON.stringify(makeCourseQuery());
        var courseData = [];


       //console.log("Room Q: "+JSON.stringify(roomQuery));
       //console.log("Course Q: "+JSON.stringify(courseQuery));
       ////////////query for room/////////////////////////////////////////////

            var roomPromise = $.ajax("/query", {
                type: "POST",
                data: roomQuery,
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    roomData = data["result"];
                    //console.log(roomData);
                }
            }).fail(function (e) {
                spawnHttpErrorModal(e)
            });


            //////////////query for courses/////////////////////////////////////////
            var coursePromise = $.ajax("/query", {
                type: "POST",
                data: courseQuery,
                contentType: "application/json",
                dataType: "json",
                success: function (data) {

                    //process the course data
                    var course_dict = {};
                    for (i = 0; i < data["result"].length; i++) {
                        var name = data["result"][i]['courses_dept'] + data["result"][i]['courses_id'];
                        if (!(name in course_dict) || parseInt(course_dict[name]['courses_year']) < parseInt(data["result"][i]['courses_year'])) {
                            course_dict[name] = data["result"][i];
                        }
                    }

                    courseData = [];
                    for (var k in course_dict) {

                        courseData.push(course_dict[k]);
                    }


                }
            }).fail(function (e) {
                spawnHttpErrorModal(e)
            });


            ////////////////promise for first two queries /////////////////////////////////////////
            Promise.all([roomPromise, coursePromise]).then(function(){

            ////////////////process data from room+courses query//////////////////////////////////

               // console.log(courseData);

                var scheduleQuery = {
                    rooms: roomData.map(function (d) {return d['rooms_name']}),
                    courses: courseData.map(function (d) {return d['courses_uuid']})
                }
                //console.log("QUERY: " + JSON.stringify(scheduleQuery));


            //////////////////schedule query///////////////////////////////////////////////////////
                    $.post('http://localhost:4321/schedule', scheduleQuery, function (response) {
                       // console.log(JSON.stringify(response));
                        displaySchedule(response);


                    }).fail(function(){
                        window.alert("Sorry, this, does not work as a schedule.");
                    });

            }, function(err){
                window.alert("Sorry, this, does not work as a schedule.");
                console.log(err);
            }
        );

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