module.exports = function convertToNewDataType(oldTeselagenJson) {
  //after the file has been parsed, but before it's been saved, check for features with multiple locations and split them
  oldTeselagenJson.features.forEach(function(feature) {
    if (feature.locations[0]) {
      if (feature.locations.length > 1) {
        for (var i = 1; i < feature.locations.length; i++) { //start at index 1, not 0!
          //for every location except for the first one, 
          var location = feature.locations[i];
          clonedFeature = JSON.parse(JSON.stringify(feature));
          clonedFeature.start = location.start;
          clonedFeature.end = location.end;
          delete clonedFeature.locations; //This array is no longer used to get start and end bp and doesn't need to be in db
          //clonedFeature.locations = []; //strip the locations from the cloned feature (we won't be using locations whatsoever in our app)
          oldTeselagenJson.features.push(clonedFeature);
        }
        //strip the locations from the original feature (this should prevent any 
        //issues from the locations data contradicting the feature start/end data)
        //feature.locations = [];
      }

      feature.start = feature.locations[0].start;
      feature.end = feature.locations[0].end;
    }
    delete feature.locations;

  });
  if (Array.isArray(oldTeselagenJson.sequence)) {
    oldTeselagenJson.sequence = oldTeselagenJson.sequence.join('');
  }
};