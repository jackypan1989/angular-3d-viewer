/**
 * Angular 3d Viewer
 * @version v0.0.1 - 2014-04-14
 * @link http://jackypan1989.github.com/angular-3d-viewer
 * @author Guan Yu Pan
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';

angular.module('angular-3d-viewer', []);
angular.module('angular-3d-viewer')
  .directive('hello', function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<canvas id="mainCanvas"></canvas>',
    link: function (scope, element, attrs) {
      var renderer, scene, camera;
      var mesh = [];
      var index = 0;
      var step = 0;
      var width = 800;
      var height = 600;
      var rotate = false;

      init();

      function init() {

        renderer = new THREE.WebGLRenderer({canvas: document.getElementById('mainCanvas')});
        renderer.setSize( width, height );
        renderer.setClearColor(0xEEEEEE);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
        camera.position.set(0, 0, 70);
        scene.add(camera);

        var directionalLight = new THREE.DirectionalLight( 0xffffff );
        directionalLight.position.x = 0; 
        directionalLight.position.y = 0; 
        directionalLight.position.z = 1; 
        directionalLight.position.normalize();
        scene.add( directionalLight );

        var material = new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0xAAAAAA, specular: 0x111111, shininess: 200 } );
        var loader = new THREE.STLLoader();
        loader.addEventListener('load', function (event) {
          var geometry = event.content;
          // var mesh = new THREE.Mesh( geometry, material );
          geometry.computeFaceNormals();
          mesh[index] = new THREE.Mesh( 
            geometry,
            new THREE.MeshNormalMaterial({
                overdraw:true
            }
            // new THREE.MeshLambertMaterial({
            //     overdraw:true,
            //     color: 0xaa0000,
            //     shading: THREE.FlatShading
            // }
          ));

          mesh[index].position = new THREE.Vector3(0, -30, 0);

          scene.add(mesh[index]);
          index++;
          if (index >= 2) animate();
          for(var i = 0; i < mesh.length; i++) {
            mesh[i].visible = false;
          }

           mesh[0].visible = true;
        });
        
        async.series([
            function(callback){
                // do some more stuff ...
                loader.load( './models/Subsetup2_Mandibular.stl');
                callback(null, 'two');
            },
            function(callback){
                // do some more stuff ...
                loader.load( './models/Subsetup1_Mandibular.stl');
                callback(null, 'three');
            },
            function(callback){
                // do some stuff ...
                loader.load( './models/Mandibular.stl');
                callback(null, 'one');
            }
        ], function(err, results){
            

        });

      }

      function animate() {
        if(rotate) {
          for(var i = 0; i < mesh.length; i++) {
            mesh[i].rotation.y += 0.01;
          }
        }

        renderer.render(scene, camera);
        requestAnimationFrame( animate );
      }

      scope.viewFromTop = function() {
        camera.position.set(0, 50, 0);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromBottom = function() {
        camera.position.set(0, -100, 0);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromSide = function() {
        camera.position.set(0, 0, 70);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.nextStep = function() {
        step ++ ;
        
        if(step > mesh.length-1) {
          step = 0;
        }

        for(var i = 0; i < mesh.length; i++) {
          mesh[i].visible = false;
        }

        mesh[step].visible = true;
      }

      scope.play = function() {
        rotate = true;
      }

      scope.stop = function() {
        rotate = false;
      }
    }
  };
});
