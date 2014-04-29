angular.module('angular-3d-viewer')
  .directive('viewer', function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<canvas id="mainCanvas"></canvas>',
    link: function (scope, element, attrs) {
      var renderer, scene, camera, controls, loader;
      var meshs = [];
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
        camera.position.set(0, 0, 100);
        scene.add(camera);

        controls = new THREE.TrackballControls(camera, document.getElementById('mainCanvas'));
        controls.addEventListener( 'change', render );

        var directionalLight = new THREE.DirectionalLight( 0xffffff );
        directionalLight.position.x = 0; 
        directionalLight.position.y = 0; 
        directionalLight.position.z = 1; 
        directionalLight.position.normalize();
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( 0xffffff );
        directionalLight.position.x = 0; 
        directionalLight.position.y = 0; 
        directionalLight.position.z = -1; 
        directionalLight.position.normalize();
        scene.add( directionalLight );

        var material = new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0xAAAAAA, specular: 0x111111, shininess: 200 } );
        loader = new THREE.STLLoader();
        loader.addEventListener('load', function (event) {
          var geometry = event.content;
          geometry.computeFaceNormals();
          
          var mesh;
          if (event.info.type === 'tooth') {
            mesh = new THREE.Mesh( 
              geometry,
              new THREE.MeshLambertMaterial({
                  overdraw:true,
                  color: 0xFFFFFF,
              }
            ));
          } else {
            mesh = new THREE.Mesh( 
              geometry,
              new THREE.MeshLambertMaterial({
                  overdraw:true,
                  color: 0xF095B4
              }
            ));
          }
          
          mesh.info = event.info;
          mesh.position = new THREE.Vector3(0, 0, 0);
          meshs.push(mesh);
          scene.add(mesh);
        });
        load();
      }

      function load() {
        for (var i = 0; i<1 ;i+=1) {
          // load top tooth
          for (var j = 1; j<=16; j+=1) {
            loader.load('./models/example/stage'+i+'/Tooth_'+j+'.stl', {stage: i, type: 'tooth', location: 'top'});
          }

          // load btm tooth
          for (var j = 17; j<=32; j+=1) {
            loader.load('./models/example/stage'+i+'/Tooth_'+j+'.stl', {stage: i, type: 'tooth', location: 'btm'});
          }

          // load jaw
          loader.load('./models/example/stage'+i+'/Tooth_UpperJaw.stl', {stage: i, type: 'jaw', location: 'top'});
          loader.load('./models/example/stage'+i+'/Tooth_LowerJaw.stl', {stage: i, type: 'jaw', location: 'btm'});
        }
        animate();
      }

      function animate() {
        if(rotate) {
          for(var i = 0; i < meshs.length; i++) {
            meshs[i].rotation.y += 0.01;
          }
        }
        requestAnimationFrame(animate);
        controls.update();
        render();
      }

      function render() {
        renderer.render(scene, camera);
      }

      function loadFiles(fileName) {
        loader.load('./models/'+fileName , fileName);
        // loader.load('./models/PokeBall.stl');
      }

      scope.toggleTop = function () {
        console.log(meshs);
        for(var i = 0; i < meshs.length; i++) {
          if(meshs[i].info.location === 'top') {
            meshs[i].visible = !meshs[i].visible;
          }
        }
      }

      scope.toggleBtm = function () {
        for(var i = 0; i < meshs.length; i++) {
          if(meshs[i].info.location === 'btm') { 
            meshs[i].visible = !meshs[i].visible;
          }
        }
      }

      scope.viewFromTop = function() {
        scope.init();
        camera.position.set(0, 100, 0);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromBottom = function() {
        scope.init();
        camera.position.set(0, -100, 0);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromFront = function() {
        scope.init();
        camera.position.set(0, 0, 100);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromBack = function() {
        scope.init();
        camera.position.set(0, 0, -100);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromLeft = function() {
        scope.init();
        camera.position.set(-100, 0, 0);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromRight = function() {
        scope.init();
        camera.position.set(100, 0, 0);
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

      scope.init = function() {
        scope.stop();
        for(var i = 0; i < meshs.length; i++) {
          meshs[i].rotation.x = 0;
          meshs[i].rotation.y = 0;
          meshs[i].rotation.z = 0;
          meshs[i].position = new THREE.Vector3(0, 0, 0);
        }
        camera.position.set(0, 0, 100);
      }

      scope.play = function() {
        rotate = true;
      }

      scope.stop = function() {
        rotate = false;
      }

      scope.load = function(fileName) {
        var control = document.getElementById('files');
        control.addEventListener('change', function(event) {
          var i = 0,
              files = control.files,
              len = files.length;
          for (; i < len; i++) {
            console.log(files[i]);
            console.log('Filename: ' + files[i].name);
            console.log('Type: ' + files[i].type);
            console.log('Size: ' + files[i].size + ' bytes');
          }
        }, false);
        loadFiles(control.files[0].name);
      }


    }
  };
});