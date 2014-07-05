'use strict';

angular.module('myApp', ['angular-3d-viewer']);
angular.module('myApp')
  .controller('myCtrl', ['$scope', function($scope, $log) {
    $scope.step = 0;
    $scope.colors = [
      {name:'white', value:'0xFFFFFF'},
      {name:'purple', value:'0xbdb3e8'},
      {name:'grey', value:'0xbfd8ff'},
      {name:'green', value:'0xd5f8ff'},
      {name:'yellow', value:'0xf4ffd8'}
    ];
    $scope.myColor = $scope.colors[0];
    $scope.slider = {
      'options': {
        slide: function (event, ui) { 
          $scope.onlyStepShow($scope.step_anchor);
        }
      }
    };

    $scope.allWhite = function() {
      $scope.changeAllColor();
      $(".selectColor").val(0);
    };

  }]);

$("body").css("overflow", "hidden");
$("body").css("overflow", "auto");

jQuery(document).ready( function(){
    jQuery('body').fadeIn(1000);
    $(function() {
      $( "#dialog" ).dialog({ 
        position: { my: "right bottom", at: "right center", of: window }
      }, {
        height: 350
      });
    });
} );