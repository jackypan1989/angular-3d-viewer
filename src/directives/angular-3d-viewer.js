angular.module('angular-3d-viewer')
  .directive('viewer', function($http) {
  return {
    restrict: 'E',
    replace: true,
    template: '<canvas id="mainCanvas"></canvas>',
    link: function (scope, element, attrs) {
      scope.step_anchor = 0;
      scope.step_num = 4;
      scope.data = {};
      scope.rotate = false;
      scope.message = 'Initialize canvas...';
      scope.showTop = true;
      scope.showBtm = true;
      scope.showTooth = true;
      scope.showJaw = true;

      var meshs = scope.meshs = new Array(scope.step_num);
      for(var i = 0; i < scope.step_num; i+=1) {
        meshs[i] = [];
      }

      var renderer, scene, camera, controls, loader;
      var width = 720;
      var height = 540;

      function init() {
        renderer = new THREE.WebGLRenderer({canvas: document.getElementById('mainCanvas')});
        renderer.setSize( width, height );
        renderer.setClearColor(0xDDDDDD);
        scene = new THREE.Scene();

        setCamera();
        setControl();
        setLight();
        setAxes();
        setLoader();
        
        loadInfo();
        load();
        animate();
      }

      function setCamera() {
        // camera = new THREE.PerspectiveCamera(100, width / height, 1, 10000);
        camera = new THREE.OrthographicCamera( width / - 10, width / 10, height / 10, height / - 10, 1, 1000 );
        camera.position.set(0, 0, 75);
        scene.add(camera);
      }

      function setControl() {
        controls = new THREE.TrackballControls(camera, document.getElementById('mainCanvas'));
        controls.addEventListener( 'change', render );
      }

      function setLight() {
        var light_color = 0xcccccc;
        var directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.x = 0; 
        directionalLight.position.y = 0; 
        directionalLight.position.z = 1; 
        // directionalLight.position.normalize();
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.x = 0; 
        directionalLight.position.y = 0; 
        directionalLight.position.z = -1; 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.x = 0; 
        directionalLight.position.y = 1; 
        directionalLight.position.z = 0; 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.x = 0; 
        directionalLight.position.y = -1; 
        directionalLight.position.z = 0; 
        scene.add( directionalLight );
      }

      function setLoader() {
        loader = new THREE.STLLoader();
        loader.addEventListener('load', function (event) {
          scope.message = 'load model ..';

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
          if(mesh.info.stage !== 0) mesh.visible = false;
          meshs[mesh.info.stage].push(mesh);
          
          scene.add(mesh);
        });
      }

      function setAxes() {
        var length = 1000;
        var axes = new THREE.Object3D();

        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

        scene.add(axes);
      }

      function buildAxis( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat; 

        if(dashed) {
          mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
        } else {
          mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line( geom, mat, THREE.LinePieces );

        return axis;
      }

      function load() {
        for (var i = 0; i<4 ;i+=1) {
          // load top tooth
          for (var j = 1; j<=16; j+=1) {
            loader.load('./models/example/stage'+i+'-zip/Tooth_'+j+'.stl', {stage: i, type: 'tooth', location: 'top'});
          }

          // load btm tooth
          for (var j = 17; j<=32; j+=1) {
            loader.load('./models/example/stage'+i+'-zip/Tooth_'+j+'.stl', {stage: i, type: 'tooth', location: 'btm'});
          }

          // load jaw
          loader.load('./models/example/stage'+i+'-zip/Tooth_UpperJaw.stl', {stage: i, type: 'jaw', location: 'top'});
          loader.load('./models/example/stage'+i+'-zip/Tooth_LowerJaw.stl', {stage: i, type: 'jaw', location: 'btm'});
        }
      }

      function loadInfo() {
        $http.get('data.json').then(function(result) {
          scope.data = result.data;
          scope.$apply();
        });
      }

      function animate() {
        if(scope.rotate) {
          for(var i = 0; i < meshs.length; i++) {
            for(var j = 0; j < meshs[i].length; j++) {
              meshs[i][j].rotation.y += 0.01;
            }
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
        for(var i = 0; i < meshs[scope.step_anchor].length; i++) {
          if(meshs[scope.step_anchor][i].info.location === 'top') {
            meshs[scope.step_anchor][i].visible = !meshs[scope.step_anchor][i].visible;
          }
        }
      }

      scope.toggleBtm = function () {
        for(var i = 0; i < meshs[scope.step_anchor].length; i++) {
          if(meshs[scope.step_anchor][i].info.location === 'btm') { 
            meshs[scope.step_anchor][i].visible = !meshs[scope.step_anchor][i].visible;
          }
        }
      }

      scope.viewFromTop = function() {
        scope.init();
        camera.position.set(1, 75, 0);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromBottom = function() {
        scope.init();
        camera.position.set(0, -75, 0);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromFront = function() {
        scope.init();
        camera.position.set(0, 0, 75);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromBack = function() {
        scope.init();
        camera.position.set(0, 0, -75);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromLeft = function() {
        scope.init();
        camera.position.set(-75, 0, 0);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.viewFromRight = function() {
        scope.init();
        camera.position.set(75, 0, 0);
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
      }

      scope.showStep = function(step) {
        for(var i = 0; i < meshs[scope.step_anchor].length; i++) {
          meshs[scope.step_anchor][i].visible = false;
        }

        for(var i = 0; i < meshs[step].length; i++) {
          meshs[step][i].visible = true;
        }

        // if(scope.showTop) {
        //   for(var i = 0; i < meshs[scope.step_anchor].length; i++) {
        //     if(meshs[scope.step_anchor][i].info.location === 'top') {
        //       meshs[scope.step_anchor][i].visible = !meshs[scope.step_anchor][i].visible;
        //     }
        //   }
        // } else if(scope.showBtm) {
        //   for(var i = 0; i < meshs[scope.step_anchor].length; i++) {
        //     if(meshs[scope.step_anchor][i].info.location === 'btm') {
        //       meshs[scope.step_anchor][i].visible = !meshs[scope.step_anchor][i].visible;
        //     }
        //   }
        // }

        scope.step_anchor = step;
      }

      scope.nextStep = function() {
        if(scope.step_anchor === scope.step_num-1) {
          scope.showStep(0);
        } else {
          scope.showStep(scope.step_anchor+1);
        }
      }

      scope.lastStep = function() {
        if(scope.step_anchor === 0) {
          scope.showStep(scope.step_num-1);
        } else {
          scope.showStep(scope.step_anchor-1);
        }
      }

      scope.init = function() {
        scope.stop();
        controls.reset();
        for(var i = 0; i < meshs.length; i++) {
          for(var j = 0; j < meshs[i].length; j++) {
            meshs[i][j].position = new THREE.Vector3(0, 0, 0);
            meshs[i][j].rotation.x = 0;
            meshs[i][j].rotation.y = 0;
            meshs[i][j].rotation.z = 0;
          }
        }
      }

      scope.play = function() {
        scope.rotate = true;
      }

      scope.stop = function() {
        scope.rotate = false;
      }

      init();

    }
  };
});