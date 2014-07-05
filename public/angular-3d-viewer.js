angular.module('angular-3d-viewer',['kendo.directives', 'ui.slider']);
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
      scope.step_visible = [];
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
        scope.step_visible[i] = false;
      }
      scope.step_visible[0] = true;

      var renderer, projector, scene, camera, controls, loader;
      var topCenter = {}, btmCenter = {}, center= {};

      var width = window.innerWidth;
      var height = window.innerHeight * 0.85;
      var zoom = 15;

      function init() {
        projector = new THREE.Projector();
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
        directionalLight.position.set(-1, 2, 1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(-1, -2, 1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(1, -2, -1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(-1, 2, -1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(-1, -2, -1).normalize(); 
        scene.add( directionalLight );

        directionalLight = new THREE.DirectionalLight( light_color );
        directionalLight.position.set(3, 0, 0).normalize(); 
        scene.add( directionalLight );
      }

      function setLoader() {
        loader = new THREE.STLLoader();
        loader.addEventListener('load', function (event) {
          scope.message = 'load model ..';

          var geometry = event.content;

          if(event.info.stage == 0 && event.info.type == 'jaw') {
            geometry.computeBoundingBox();
            var bBox = geometry.boundingBox;
            if(event.info.location == 'top') {
              topCenter.x = (bBox.min.x + bBox.max.x) / 2;
              topCenter.y = (bBox.min.y + bBox.max.y) / 2;
              topCenter.z = (bBox.min.z + bBox.max.z) / 2;
            } else {
              btmCenter.x = (bBox.min.x + bBox.max.x) / 2;
              btmCenter.y = (bBox.min.y + bBox.max.y) / 2;
              btmCenter.z = (bBox.min.z + bBox.max.z) / 2;
            }
          }

          var mesh;
          if (event.info.type === 'tooth') {
            geometry.mergeVertices();
            geometry.computeVertexNormals();
            mesh = new THREE.Mesh( 
              geometry,
              new THREE.MeshLambertMaterial({
                  overdraw:true,
                  color: 0xFFFFFFF,
                  shading: THREE.SmoothShading
              }
            ));
          } else if (event.info.type === 'jaw') {
            mesh = new THREE.Mesh( 
              geometry,
              new THREE.MeshLambertMaterial({
                  overdraw:true,
                  color: 0xBF6969, //804040
                  shading: THREE.SmoothShading
              }
            ));
          } else {
            mesh = new THREE.Mesh( 
              geometry,
              new THREE.MeshNormalMaterial({
                  overdraw:true,
              }
            ));


          }
          
          mesh.info = event.info;
          mesh.position = new THREE.Vector3(0, 0, 0);
          if(center.x) mesh.position.set(-center.x, -center.y, -center.z);
          mesh.visible = false;
          meshs[mesh.info.stage].push(mesh);
          scope.firstStep();
          scene.add(mesh);
        });
      }

      function setAxes() {
        var axes = new THREE.AxisHelper(1000);
        axes.position.set(0, 0, 0);
        scene.add(axes);
      }

      function setCenter(){
        center.x = (topCenter.x + btmCenter.x) / 2 ;
        center.y = (topCenter.y + btmCenter.y) / 2 ;
        center.z = (topCenter.z + btmCenter.z) / 2 ;

        for(var i = 0; i<meshs.length; i++) {
          for(var j = 0; j<meshs[i].length; j+=1) {
            meshs[i][j].position.set(-center.x, -center.y, -center.z);
            meshs[i][j].rotation.set( 0, 0, 0 );
          }
        }

        console.log(center);
      }

      function load() {
        // loader.load('./data/org/Tooth_2.stl', {stage: 0, type: 'tooth', location: 'top'});
        // loader.load('./data/org/Tooth_17.stl', {stage: 0, type: 'tooth', location: 'btm'});
        // loader.load('./data/org/Tooth_UpperJaw.stl', {stage: 0, type: 'jaw', location: 'top'});
        // loader.load('./data/org/Tooth_LowerJaw.stl', {stage: 0, type: 'jaw', location: 'btm'});
        // loader.load('./data/exp/Tooth_2.stl', {stage: 1, type: 'tooth', location: 'top'});
        // loader.load('./data/exp/Tooth_17.stl', {stage: 1, type: 'tooth', location: 'btm'});
        // loader.load('./data/exp/Tooth_UpperJaw.stl', {stage: 1, type: 'jaw', location: 'top'});
        // loader.load('./data/exp/Tooth_LowerJaw.stl', {stage: 1, type: 'jaw', location: 'btm'});

        for (var i = 0; i<scope.step_num ;i+=1) {
          loader.load('./data/'+i+'/Tooth_Upper.stl', {stage: i, type: 'tooth', location: 'top'});
          loader.load('./data/'+i+'/Tooth_Lower.stl', {stage: i, type: 'tooth', location: 'btm'});
          loader.load('./data/'+i+'/Tooth_UpperJaw.stl', {stage: i, type: 'jaw', location: 'top'});
          loader.load('./data/'+i+'/Tooth_LowerJaw.stl', {stage: i, type: 'jaw', location: 'btm'});
        }
        loader.load('./data/Tooth_UpperProtho.stl', {stage: scope.step_num-1, type: 'protho', location: 'top'});
        loader.load('./data/Tooth_LowerProtho.stl', {stage: scope.step_num-1, type: 'protho', location: 'btm'});
      }

      function loadInfo() {
        scope.profile = profile;
      }

      function animate() {
        if(!center.x && topCenter.x && btmCenter.x) {
          setCenter();
          scope.step_visible[0] = true;
          for(var i = 0; i < meshs[0].length; i++) {
            meshs[0][i].visible = true;
          }
        }

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
        scope.show();
      }

      scope.toggleBtm = function () {
        scope.showBtm = !scope.showBtm;
        scope.show();
      }

      scope.toggleTeeth = function () {
        scope.showTeeth = !scope.showTeeth;
        scope.show();
      }

      scope.toggleJaw = function () {
        scope.showJaw = !scope.showJaw;
        scope.show();
      }
      
      scope.toggleProtho = function () {
        scope.finalStep();
        for(var i = 0; i<meshs.length; i++) {
          for(var j = 0; j<meshs[i].length; j+=1) {
            if(meshs[i][j].info.type === 'protho') {
              meshs[i][j].visible = true;
            }
          }
        }
      }

      scope.toggleSplit = function() {
        scope.showSplit = true;
        scope.init();
        for(var i = 0; i<meshs.length; i++) {
          for(var j = 0; j<meshs[i].length; j+=1) {
            if(meshs[i][j].info.location === 'btm') {
              meshs[i][j].position.set(-center.x, -center.y, -center.z+40);
            } else {
              meshs[i][j].position.set(-center.x, -center.y+scope.profile.split_shift, -center.z-40);
              meshs[i][j].rotation.set(-Math.PI, 0, 0);  
            }
          }
        }

        controls.reset();
        camera.left = -width / zoom * 2;
        camera.right = width / zoom * 2;
        camera.top = height / zoom * 2 +10;
        camera.bottom = -height / zoom * 2 +10;
        camera.position.y = 400;
        var camTarget = new THREE.Vector3( 0, 0, 0 );
        camera.lookAt(camTarget);
        camera.updateProjectionMatrix();
      }

      scope.viewFromTop = function() {
        controls.reset();
        camera.up = new THREE.Vector3(0, 0, -1);
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

      scope.show = function() {
        for(var i = 0; i < scope.step_num; i++) {
          if(scope.step_visible[i]) {
            for(var j = 0; j < meshs[i].length; j++) {
              meshs[i][j].visible = false;
              if(scope.showTop && meshs[i][j].info.location === 'top') {
                if(scope.showTeeth && meshs[i][j].info.type === 'tooth') {
                  meshs[i][j].visible = true;
                } else if (scope.showJaw && meshs[i][j].info.type === 'jaw') {
                  meshs[i][j].visible = true;
                }
              } else if(scope.showBtm && meshs[i][j].info.location === 'btm') {
                if(scope.showTeeth && meshs[i][j].info.type === 'tooth') {
                  meshs[i][j].visible = true;
                } else if (scope.showJaw && meshs[i][j].info.type === 'jaw') {
                  meshs[i][j].visible = true;
                }
              }
            }
          } else {
            for(var j = 0; j < meshs[i].length; j++) {
              meshs[i][j].visible = false;
            }
          }
        }
      }

      scope.nextStep = function() {
        if(scope.step_anchor === scope.step_num-1) {
          // scope.showStep(0);
        } else {
          scope.step_visible[scope.step_anchor] = false;
          scope.step_visible[scope.step_anchor+1] = true;
          scope.step_anchor++
          scope.show();
        }
      }

      scope.lastStep = function() {
        if(scope.step_anchor === 0) {
          // scope.showStep(scope.step_num-1);
        } else {
          scope.step_visible[scope.step_anchor] = false;
          scope.step_visible[scope.step_anchor-1] = true;
          scope.step_anchor--;
          scope.show();
        }
      }

      scope.firstStep = function() {
        scope.step_visible[scope.step_anchor] = false;
        scope.step_visible[0] = true;
        scope.step_anchor = 0;
        scope.show();
      }

      scope.finalStep = function() {
        scope.step_visible[scope.step_anchor] = false;
        scope.step_visible[scope.step_num-1] = true;
        scope.step_anchor = scope.step_num-1;
        scope.show();
      }

      scope.changeColor = function(color, step) {
        for(var i = 0; i<meshs[step].length; i+=1) {
          if(meshs[step][i].info.type === 'tooth') {
            meshs[step][i].material.color.setHex( color.value );
          }
        }
      }

      scope.changeAllColor = function() {
        for(var i = 0; i<meshs.length; i+=1) {
          for(var j = 0; j<meshs[i].length; j+=1) {
            if(meshs[i][j].info.type === 'tooth') {
              meshs[i][j].material.color.setHex( 0xffffff );
            }
          }
        }
      }

      scope.toggleStepShow = function(step) {
        scope.step_visible[step] = true;
        scope.show();
      }

      scope.toggleStepHide = function(step) {
        scope.step_visible[step] = false;
        scope.show();
      }

      scope.onlyStepShow = function(step) {
        for(var i = 0; i<meshs.length; i+=1) {
          scope.step_visible[i] = false;
        }
        scope.step_visible[step] = true;
        scope.step_anchor = step;
        scope.show();
      }

      scope.init = function() {
        // scope.stop();
        controls.reset();
        camera.left = -width / zoom;
        camera.right = width / zoom;
        camera.top = height / zoom;
        camera.bottom = -height / zoom;
        camera.updateProjectionMatrix();
        setCenter();
        for(var i = 0 ; i<scope.step_visible.length; i++) {
          scope.step_visible[i] = false;
        }
        scope.firstStep();
      }

      scope.play = function() {
        // init
        if(!scope.playStep) {
          scope.playStep = true;
          for(var i = 0 ; i<scope.step_visible.length; i++) {
            if(i !== scope.step_anchor) { 
              scope.step_visible[i] = false;
            }
          }
          scope.step_visible[scope.step_anchor] = true;
          scope.show();
        } 

        if(scope.playStep && scope.step_anchor !== scope.step_num-1 ) {
          $timeout(function(){
            scope.nextStep();
            scope.play();
          }, 1000);
        } else {
          scope.playStep = false;
        }
      }

      init();
      animate();
    }
  };
});