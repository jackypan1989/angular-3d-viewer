angular.module('angular-3d-viewer',['kendo.directives']);
angular.module('angular-3d-viewer')
  .directive('viewer', function($http, $timeout) {
  return {
    restrict: 'E',
    replace: true,
    template: '<canvas id="mainCanvas"></canvas>',
    link: function (scope, element, attrs) {
      var dom = document.getElementById('mainCanvas');
      
      scope.step_anchor = 0;
      scope.step_num = profile.step_num;
      scope.data = {};
      scope.rotate = false;
      scope.message = 'Initialize canvas...';
      scope.showTop = true;
      scope.showBtm = true;
      scope.showTeeth = true;
      scope.showJaw = true;
      scope.showSplit = false;
      scope.playStep = false;

      var meshs = scope.meshs = new Array(scope.step_num);
      for(var i = 0; i < scope.step_num; i+=1) {
        meshs[i] = [];
      }

      var renderer, projector, scene, camera, controls, loader;
      var width = window.innerWidth * 0.75;
      var height = window.innerHeight;
      var zoom = 15;

      function init() {
        projector = new THREE.Projector();
        //renderer = new THREE.CanvasRenderer({canvas: dom});
        renderer = new THREE.WebGLRenderer({canvas: dom});
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

      // set camera
      function setCamera() {
        scope.camera = camera = new THREE.OrthographicCamera( -width / zoom, width / zoom, height / zoom, -height / zoom, -1000, 1000 );
        camera.position.set(0, 0, 75);
        scene.add(camera);
      }

      // set control
      function setControl() {
        controls = new THREE.TrackballControls(camera, dom);
        controls.addEventListener( 'change', render );
      }

      // set light
      function setLight() {
        var flashlight = new THREE.SpotLight(0x999999);
        flashlight.position.set(0,0,100);
        flashlight.target = camera;
        camera.add(flashlight)

        var light_color = 0x3A3A3A;
        var directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(0, 1, 1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(0, 1, -1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(1, -2, 1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(-1, 1, 1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(-1, -2, 1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(1, -2, -1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(-1, 1, -1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(-1, -1, -1).normalize(); 
        scene.add( directionalLight );
      }

      function setLoader() {
        loader = new THREE.STLLoader();
        loader.addEventListener('load', function (event) {
          scope.message = 'load model ..';

          var geometry = event.content;

          var mesh;
          if (event.info.type === 'tooth') {
            geometry.mergeVertices();
            geometry.computeVertexNormals();
            mesh = new THREE.Mesh( 
              geometry,
              new THREE.MeshLambertMaterial({
                  overdraw:true,
                  color: 0xDDDDDD,
                  shading: THREE.SmoothShading
              }
            ));
          } else {
            mesh = new THREE.Mesh( 
              geometry,
              new THREE.MeshLambertMaterial({
                  overdraw:true,
                  color: 0xBF6969, //804040
                  shading: THREE.SmoothShading
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
        var axes = new THREE.AxisHelper(1000);
        axes.position.set(0, 0, 0);
        scene.add(axes);
      }

      function load() {
        for (var i = 0; i<scope.step_num ;i+=1) {
          // load top tooth
          for (var j = 1; j<=16; j+=1) {
            loader.load('./data/stage'+i+'-zip/Tooth_'+j+'.stl', {stage: i, type: 'tooth', location: 'top'});
          }

          // load btm tooth
          for (var j = 17; j<=32; j+=1) {
            loader.load('./data/stage'+i+'-zip/Tooth_'+j+'.stl', {stage: i, type: 'tooth', location: 'btm'});
          }

          // load jaw
          loader.load('./data/stage'+i+'-zip/Tooth_UpperJaw.stl', {stage: i, type: 'jaw', location: 'top'});
          loader.load('./data/stage'+i+'-zip/Tooth_LowerJaw.stl', {stage: i, type: 'jaw', location: 'btm'});
        }
      }

      function loadInfo() {
        scope.profile = profile;
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
        scope.showTop = !scope.showTop;
        scope.showStep(scope.step_anchor);
      }

      scope.toggleBtm = function () {
        scope.showBtm = !scope.showBtm;
        scope.showStep(scope.step_anchor);
      }

      scope.toggleTeeth = function () {
        scope.showTeeth = !scope.showTeeth;
        scope.showStep(scope.step_anchor);
      }

      scope.toggleJaw = function () {
        scope.showJaw = !scope.showJaw;
        scope.showStep(scope.step_anchor);
      }
      
      scope.toggleSplit = function() {
        scope.showSplit = true;
        scope.init();
        for(var i = 0; i<meshs.length; i++) {
          for(var j = 0; j<meshs[i].length; j+=1) {
            if(meshs[i][j].info.location === 'btm') {
              meshs[i][j].position.set(0, 0, 0);
            } else {
              meshs[i][j].position.set(0, -5, -60);
              meshs[i][j].rotation.set(-Math.PI, 0, 0);  
            }
          }
        }

        controls.reset();
        camera.left = -width / zoom * 2;
        camera.right = width / zoom * 2;
        camera.top = height / zoom * 2 +20;
        camera.bottom = -height / zoom * 2 +20;
        camera.position.y = 400;
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
        camera.updateProjectionMatrix();
      }

      scope.viewFromTop = function() {
        controls.reset();
        camera.up = new THREE.Vector3(0, 0, 1);
        controls.object.position.set(0, 75, 0);
        camera.lookAt(controls.target);
      }

      scope.viewFromBottom = function() {
        controls.reset();
        camera.up = new THREE.Vector3(0, 0, 1);
        controls.object.position.set(0, -75, 0);
        camera.lookAt(controls.target);
      }

      scope.viewFromFront = function() {
        controls.reset();
        controls.object.position.set(0, 0, 75);
        camera.lookAt(controls.target);
      }

      scope.viewFromBack = function() {
        controls.reset();
        controls.object.position.set(0, 0, -75);
        camera.lookAt(controls.target);
      }

      scope.viewFromLeft = function() {
        controls.reset();
        controls.object.position.set(-75, 0, 0);
        camera.lookAt(controls.target);
      }

      scope.viewFromRight = function() {
        controls.reset();
        controls.object.position.set(75, 0, 0);
        camera.lookAt(controls.target);
      }

      scope.showStep = function(step) {
        if(step !== scope.step_anchor) {
          for(var i = 0; i < meshs[scope.step_anchor].length; i++) {
            meshs[scope.step_anchor][i].visible = false;
          }
        }

        for(var i = 0; i < meshs[step].length; i++) {
          meshs[step][i].visible = false;
          if(scope.showTop && meshs[step][i].info.location === 'top') {
            if(scope.showTeeth && meshs[step][i].info.type === 'tooth') {
              meshs[step][i].visible = true;
            } else if (scope.showJaw && meshs[step][i].info.type === 'jaw') {
              meshs[step][i].visible = true;
            }
          } else if(scope.showBtm && meshs[step][i].info.location === 'btm') {
            if(scope.showTeeth && meshs[step][i].info.type === 'tooth') {
              meshs[step][i].visible = true;
            } else if (scope.showJaw && meshs[step][i].info.type === 'jaw') {
              meshs[step][i].visible = true;
            }
          }
        }

        scope.step_anchor = step;
      }

      scope.nextStep = function() {
        if(scope.step_anchor === scope.step_num-1) {
          // scope.showStep(0);
        } else {
          scope.showStep(scope.step_anchor+1);
        }
      }

      scope.lastStep = function() {
        if(scope.step_anchor === 0) {
          // scope.showStep(scope.step_num-1);
        } else {
          scope.showStep(scope.step_anchor-1);
        }
      }

      scope.init = function() {
        // scope.stop();
        controls.reset();
        camera.left = -width / zoom;
        camera.right = width / zoom;
        camera.top = height / zoom;
        camera.bottom = -height / zoom;
        camera.updateProjectionMatrix();
        for(var i = 0; i < meshs.length; i++) {
          for(var j = 0; j < meshs[i].length; j++) {
            meshs[i][j].position.set( 0, 0, 0 );
            meshs[i][j].rotation.set( 0, 0, 0 );
          }
        }
        scope.showStep(0);
      }

      scope.play = function() {
        // scope.rotate = true;
        if(!scope.playStep) {
          scope.playStep = true;
          // scope.showStep(0);
        }
        
        if(scope.step_anchor !== scope.step_num-1 ) {
          $timeout(function(){
            scope.nextStep();
            scope.play();
          }, 1000);
        } else {
          scope.stop();
        }

      }

      scope.stop = function() {
        // scope.rotate = false;
        scope.playStep = false;
      }

      init();

    }
  };
});