$("#menu-toggle")
    .click(function(e) {
        //e.preventDefault();
        $("#wrapper")
            .toggleClass("toggled");
    });
var map;
//This is a blank array for all listing markers.
var markers = [];

//this is an array containg info of all the markers
//http://opensoul.org/2011/06/23/live-search-with-knockoutjs/
//These are real estate listings that will be shown.
var locations = [{
        title: 'Amrut Hotel Karwar',
        location: {
            lat: 14.8090,
            lng: 74.1303
        }
    },
    {
        title: 'LakeView Hotel Hubli',
        location: {
            lat: 15.371598,
            lng: 75.101166
        }
    },
    {
        title: 'Mysore Palace Mysuru',
        location: {
            lat: 12.3051,
            lng: 76.6551
        }
    },
    {
        title: 'Hampi, Karnataka',
        location: {
            lat: 15.3350,
            lng: 76.4600
        }
    },
    {
        title: 'Madikeri, Karnataka',
        location: {
            lat: 12.4244,
            lng: 75.7382
        }
    },
    {
        title: 'Udupi, Karnataka',
        location: {
            lat: 13.3408807,
            lng: 74.7421427
        }
    }
];

//https://developers.google.com/maps/documentation/javascript/styling
var styles = [{
        elementType: 'geometry',
        stylers: [{
            color: '#242f3e'
        }]
    },
    {
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#242f3e'
        }]
    },
    {
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#746855'
        }]
    },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#d59563'
        }]
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#d59563'
        }]
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{
            color: '#263c3f'
        }]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#6b9a76'
        }]
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{
            color: '#38414e'
        }]
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#212a37'
        }]
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#9ca5b3'
        }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{
            color: '#746855'
        }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#1f2835'
        }]
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#f3d19c'
        }]
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{
            color: '#2f3948'
        }]
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#d59563'
        }]
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{
            color: '#17263c'
        }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#515c6d'
        }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#17263c'
        }]
    }
];



//this function is called when error occurs while loading the google map
var googleError = function() {
    alert('Error connecting to Google Maps. Please try again later.');
};

//https://developers.google.com/maps/documentation/javascript/markers
function initMap() {
    // Constructor creates a new Map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 21.7679,
            lng: 78.8718
        },
        zoom: 5,
        styles: styles,
        mapTypeControl: false
    });
    ko.applyBindings(new ViewModel());
}

//viewModel
var ViewModel = function() {
    var self = this;
    self.locationList = ko.observableArray(locations);
    self.title = ko.observable('');
    self.currentMarker = function(place) {
        console.log(place.title);
        // trigger the click event of the marker
        new google.maps.event.trigger(place.marker, 'click');
    };
    self.OnClickPlace = ko.observable('');
    self.search = ko.computed(function() {
        var userInput = self.OnClickPlace().toLowerCase(); // Make search case insensitive
        return searchResult = ko.utils.arrayFilter(self.locationList(), function(item) {
            var title = item.title.toLowerCase(); // Make search case insensitive
            var userInputIsInTitle = title.indexOf(userInput) >= 0; // true or false
            if (item.marker) {
                item.marker.setVisible(userInputIsInTitle); // toggle visibility of the marker
            }
            return userInputIsInTitle;
        });
    });
    var largeInfowindow = new google.maps.InfoWindow(); //creating the Infowindow
    //lat long bounds instance which captures the southwest and 
    //northeast corners of the view port.
    var bounds = new google.maps.LatLngBounds(); //bounds of the map        
    //The following group uses the location array to create an array of markers on initialize.
    var defaultIcn = makeMarkerIcon('0091ff');
    var HighlightedIcn = makeMarkerIcon('ffff24');

    for (var i = 0; i < locations.length; i++) //creating marker and infowindow for each and every location in the locations list
    {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        //Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            icon: defaultIcn,
            map: map,
            id: i
        });
        //markers.push(marker);
        locations[i].marker = marker; //linking with the click using the locations array
        // Push the marker to our array of markers.
        markers.push(marker);
        //Extend the boundaries of the map for each marker.
        bounds.extend(marker.position);
        //Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() { //adding click listener to the marker
            var self = this;
            populateInfoWindow(this, largeInfowindow);
            this.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){self.setAnimation(null)}, 1100);
        });
        marker.addListener('mouseover', function() {
            this.setIcon(HighlightedIcn);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcn);
        });
    }
    //map.fitBounds(bounds);

};

//This function populates the infowindow when the marker is clicked.
function populateInfoWindow(marker, infowindow) {
    //Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        //Clear the infowindow content to give the streetview time to load.
        infowindow.marker = marker;
        //Make sure the marker property is cleared if the infowindow is closed.
        infowindow.setContent('<div>' + marker.title + '</div>');
        //infowindow.open(map, marker);
        infowindow.addListener('closeclick', function() {
            infowindow.close(map, marker);
            //infowindow.marker = null;
        });

        //street view on the marker
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        //https://developers.google.com/maps/documentation/javascript/streetview
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                //infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panaromaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panaroma = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panaromaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No streetview Found</div>');
            }
        }

        // http://knockoutjs.com/documentation/binding-syntax.html
        // load wikipedia data
        var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        $.ajax({
                url: wikiURL,
                dataType: "jsonp"
            })
            .done(function(response) {
                var articleStr = response[1];
                var URL = 'http://en.wikipedia.org/wiki/' + marker.title;
                // Use streetview service to get the closest streetview image within
                // 50 meters of the markers position
                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                infowindow.setContent('<div>' + marker.title + '</div><br><a href ="' + URL + '">' + URL + '</a><hr><div id="pano"></div>');
                // Open the infowindow on the correct marker.
                infowindow.open(map, marker);
                console.log(URL);
                // error handling for jsonp requests with fail method.
            })
            .fail(function(jqXHR, textStatus) {
                alert("failed to load wikipedia resources");
            });
    }
}

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}