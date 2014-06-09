'use strict';

angular.module('myApp', ['angular-3d-viewer']);

var FizzyText = function() {
  this.id = 'SOV00234';
  this.name = '王小美';
  this.clinic = '舒服美牙醫診所';
  this.doctor = '陳冠宇';
};

window.onload = function() {
  var text = new FizzyText();
  var gui = new dat.GUI();
  var f1 = gui.addFolder('客戶資料');
  f1.add(text, 'id').name('編號');
  f1.add(text, 'name').name('姓名');
  f1.add(text, 'clinic').name('診所');;
  f1.add(text, 'doctor').name('醫師');;
};
