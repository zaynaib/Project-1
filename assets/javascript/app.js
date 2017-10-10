//resources of leafletJs
//http://leafletjs.com/reference-1.2.0.html#class
//https://harrywood.co.uk/maps/examples/leaflet/5-events.view.html
//http://usabilityetc.com/2016/07/how-to-center-a-leaflet-map-on-a-marker/
//http://leafletjs.com/examples/zoom-levels/
//https://teamtreehouse.com/library/ajax-basics
//http://leafletjs.com/reference-1.2.0.html#interactive-layer
//https://stackoverflow.com/questions/38768576/in-firebase-when-using-push-how-do-i-get-the-unique-id-and-store-in-my-databas



//zipcodeZoom
//http://techslides.com/zoom-into-us-zip-codes-in-leaflet-map
//https://www.udacity.com/course/firebase-in-a-weekend-by-google-android--ud0352

//configure the database
//database tutorial https://www.tutorialspoint.com/firebase/firebase_data.htm
var config = {
  apiKey: "AIzaSyAo3hU0OhP2Sj7cwQSnpOQSomz72WhPyO0",
  authDomain: "project-1-26662.firebaseapp.com",
  databaseURL: "https://project-1-26662.firebaseio.com",
  projectId: "project-1-26662",
  storageBucket: "",
  messagingSenderId: "1047540056380"
};

// Initialize Firebase
firebase.initializeApp(config);




//create a reference to the database
var database = firebase.database();
var ref = firebase.database().ref('points');

//intializeMap
var mymap = L.map('mapid',{
      trackResize: true,
      dragging: true,
      doubleClickZoom: true,
      zoomAnimation: true,
      markerZoomAnimation: true
    }).setView([41.8781, -87.6298], 15);

 //create and add map layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1Ijoia2FpdGx5bnN0cmFuZCIsImEiOiJjajhlcmwweWgxNjkzMzNwbTBub3ZuN3FxIn0.1Nz-cdZ8Ew7Oa3dxqxzdaQ'
    }).addTo(mymap);

   //data point icon for open pothole request
    var potholeOpen = new L.Icon({
      iconUrl: 'assets/images/icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })

    //data point icon for closed pothole request
    var potholeClosed = new L.Icon({
      iconUrl: 'assets/images/icon-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });


//get mapbound
//whatever call you get to the api key 
//
//display that in the map


//grab the user input call to the address in the query string

//https://data.cityofchicago.org/resource/787j-mys9.json?location_address=FOO
//https://dev.socrata.com/foundry/data.cityofchicago.org/787j-mys9


//https://www.mapbox.com/mapbox.js/example/v1.0.0/marker-radius-search/
//https://www.mapbox.com/mapbox.js/api/v2.2.1/l-latlng/

//if map lat and long are in this bound then map

/*

function gecoding(address){
$.get('https://nominatim.openstreetmap.org/search?format=json&q='+address, function(data){
  console.log(data);
    
    //var addressLat = data[0].lat;
    //var addressLon = data[0].lon;
    //console.log(addressLat, addressLon);
    
      
    });
}
*/



$(document).ready(function(){ //manipulate the DOM once the page is loaded
  var windowHeight = $(window).height();

  $(".button-collapse").sideNav();

  //create the map
  var appMap = buildMap();

  //grab the user's input
  var userSearch;
  window.addEventListener("keypress", function(event){

    //if the user presses enter
    if(event.which === 13) {
      event.preventDefault();
        
        //grab the value of search
        userSearch = $("#search").val();
        //make it to uppercase
        userSearch = userSearch.toUpperCase();
        console.log(userSearch);

        var address= userSearch;
    
      
   


        //get the lat and long of the users
        //gecoding(userSearch);

        //zoom into the pothole request if it exists 
        zoomUserMatch(userSearch,mymap);

       //search box disappers after user search
       searchBoxVisibility(event);

       

      }
  }); //end of input listner

  // show/hide search box on search button click
  $("#show-search-box").on("click", searchBoxVisibility);

  $("#search-menu").tabs({"swipeable": true});

}); // $(document).ready(function(){});



function buildMap() {

  //get data from the chicago data portal 
  $.ajax({
    url: "https://data.cityofchicago.org/resource/787j-mys9.json",
    type: "GET",
    data: {
      "$limit" : 5,
      "$$app_token" : "rWk97H84NMWrBWcdiG4IvjTjX"
    }
  }).done(function(data) {

    //console.log("Retrieved " + data.length + " records from the dataset!");
    console.log(data);

   

 

    //push all of this data into the firebase database

    //loop through the pothole data
    for(var i =0 ; i < data.length; i++) {

      //get the latitude
      var dataLat = data[i].latitude;
      if(dataLat === undefined){
        dataLat = 0;
      }
      //console.log(data[i].latitude);

      //get the longitude
      var dataLong = data[i].longitude;
      if(dataLong === undefined){
        dataLong = 0;
      }
      //console.log(data[i].longitude);

      //get the status of the pothole request
      var dataStatus = data[i].status;

      if(dataStatus === undefined){
        dataStatus = "undefined";
      }
      // console.log(data[i].status);

      //get the address of the datapoint   
      var dataAddress = data[i].street_address;

      //check to see if the address is defined
      if(dataAddress === undefined){
        dataAddress = "undefined";
      }
      //console.log(data[i].street_address);

      //get the log report of the pothole
      var dataAction = data[i].most_recent_action;

      //check to see if the pothole most recent action is defined
      if(dataAction === undefined){
        dataAction = "none";
      }
      //console.log("This is data action is set " +data[i].most_recent_action);

      /*
      //if the pothole status is completed show green else show red
      if (dataStatus === "Completed") {
        //console.log([dataLat, dataLong], "this  is the info")
        L.marker([dataLat, dataLong], {icon: potholeClosed}).addTo(mymap).bindPopup("<b>" + data[i].street_address + "</b><br>" + data[i].most_recent_action)
        .openPopup();

      }
      else {
        L.marker([dataLat, dataLong], {icon: potholeOpen}).addTo(mymap).bindPopup("<b>" + data[i].street_address + "</b><br>" + data[i].most_recent_action)
        .openPopup();
      }
      */
      //var marker = L.marker([dataLat,dataLong]).addTo(mymap);



     //write data into firebase database
     //write to the firebase database
     //console.log("This is data Action " + dataAction );


     /*TO DO
     Learn how to clear the database
     Learn how to check for unique data entry so it won't add everytime the page loads
     Learn how to put database information into a global array

    */

    
  
    
     //if(objectKey does not exsist in database  push)
     database.ref("/points/").push({
      latitude: dataLat,
      longitude: dataLong,
      status: dataStatus,
      address: dataAddress,
      potholeAction: dataAction


      });//end of database push

      
      //console.log(dataLat, dataLong, dataStatus, dataAction,dataAddress );

    }//end of for loop

  }); // .done function

}; // function buildMap(){}

//read in data from firebase


//zooms into the address that the user puts in the input box
function zoomUserMatch(match,map){
  
database.ref("/points/").on("child_added", function(snapshot, prevChildKey) {
  var point = snapshot.val();
  var pointAddress = point.address;
  //console.log("Address from the database " + pointAddress);

  var pointLat =point.latitude;
  //console.log("Lat from the database " + pointLat);

  var pointLong = point.longitude ;
  //console.log("Long from the database " + pointLong);

  if(pointAddress === match){
    //console.log("working");
    //var marker = L.marker([pointLat, pointLong]).addTo(mymap);
    var marker = L.marker([pointLat, pointLong], {icon: potholeClosed}).addTo(mymap);
    map.setView([pointLat, pointLong], 18);
  }

  
  //var newPost = snapshot.val().latitude;
  //console.log("newPost: "+newPost);
  
});

}




//map all those points in map bound
//if lat or long is insde the bounds then map

//https://stackoverflow.com/questions/33600480/how-to-check-if-points-are-within-radius-with-leaflet-javascript

//retrieve data from the firebase database


//http://joshuafrazier.info/leaflet-basics/
//https://github.com/Esri/esri-leaflet-geocoder geocoding


//TO DO
//clean up code
//make icon into a function
//make the map stuff global
//make sure click function acts right
//add local storage up to five projects
//add authetication with google email address
//check out geocoding
//check out d3.js tomorrow


//http://leafletjs.com/reference-1.2.0.html#map-methods-for-modifying-map-state
//setview will zoom to a specific point

//JSON parse to set the data from ajax call into an object

  

function onMapClick(e) {

  var boundaries = mymap.getBounds();
  console.log("Map on click function working");
  var corner1 = L.latLng(41.887 ,-87.7200960);
  //console.log(boundaries.contains(corner1));


  console.log(boundaries);
  //return boundaries;

  database.ref("/points/").on("child_added", function(snapshot) {
  var point = snapshot.val();
  var pointAddress = point.address;
  //console.log("Address from the database " + pointAddress);

  var pointLat =point.latitude;
  //console.log("Lat from the database " + pointLat);

  var pointLong = point.longitude ;
  //console.log("Long from the database " + pointLong);

  var corner1 = L.latLng(pointLat, pointLong);
  //console.log(corner1);

  var dataStatus = point.status;
  console.log(dataStatus)

  if (boundaries.contains(corner1)){

     //if the pothole status is completed show green else show red
      if (dataStatus === "Completed") {
        //console.log([dataLat, dataLong], "this  is the info")
       L.marker([pointLat, pointLong], {icon: potholeClosed}).addTo(mymap);

      }else{
          L.marker([pointLat, pointLong], {icon: potholeOpen}).addTo(mymap);
      }
     

      //L.marker([pointLat, pointLong], {icon: potholeClosed}).addTo(mymap);


  }

});
}

var currentBoundaries = mymap.on('click', onMapClick);
console.log(currentBoundaries);
//loop through firebase data and plot map points

function newBoundaryPoints(boundary){
  //plot points in boundaries
  //contains<bounds>
  database.ref("/points/").on("child_added", function(snapshot) {
  var point = snapshot.val();
  var pointAddress = point.address;
  //console.log("Address from the database " + pointAddress);

  var pointLat =point.latitude;
  //console.log("Lat from the database " + pointLat);

  var pointLong = point.longitude ;
  //console.log("Long from the database " + pointLong);

  var corner1 = L.latLng(pointLat, pointLong);
  //console.log(corner1);

  //Polygon.getBounds().contains(MarketLatLng);


  //mymap.getBounds().contains([lat,lng]);
  //plot point
  
  
  //var newPost = snapshot.val().latitude;
  //console.log("newPost: "+newPost);
  
});
}

    //var latlng = L.latLng(50.5, 30.5);

    //L.contains(currentBoundaries);
    //console.log(mymap.contains(currentBoundaries));

    


newBoundaryPoints();


function centerLeafletMapOnMarker(map, marker) {
  var latLngs = [ marker.getLatLng() ];
  var markerBounds = L.latLngBounds(latLngs);
  map.fitBounds(markerBounds);
}



function searchBoxVisibility(event) {
  event.preventDefault();
  
  var mainAction = document.getElementById("main-action");
  if (mainAction.style.display === "none") {
    mainAction.style.display = "block";
  } else {
    mainAction.style.display = "none";
  };
}; // end of function searchBoxVisibility(){}