'use strict';

angular.module('myApp', ['angular-3d-viewer']);

angular.module('myApp')
  .controller('DemoCtrl', ['$scope', function ($scope) {
    var Stage = {
      name: '',
      order: 0,
      Component: []
    };

    // var control = document.getElementById('files');
    // control.addEventListener('change', function(event) {
    //   var i = 0,
    //       files = control.files,
    //       len = files.length;
    //   for (; i < len; i++) {
    //     console.log(files[i]);
    //     console.log('Filename: ' + files[i].name);
    //     console.log('Type: ' + files[i].type);
    //     console.log('Size: ' + files[i].size + ' bytes');
    //   }
    // }, false);

  }]);
