(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('GenerateActivationCodeCtrl', GenerateActivationCodeCtrl);

  /* @ngInject */
  function GenerateActivationCodeCtrl($stateParams, $state, $translate, $window, OtpService, ActivationCodeEmailService, Notification, HttpUtils) {
    var vm = this;
    vm.showEmail = false;
    vm.userName = $stateParams.currentUser.userName;
    vm.otp = $stateParams.activationCode;
    vm.email = {
      to: vm.userName
        // subject: $translate.instant('generateActivationCodeModal.subjectContent'),
        // message: ''
    };
    vm.qrCode = '';
    vm.timeLeft = '';
    vm.activateEmail = activateEmail;
    vm.sendActivationCodeEmail = sendActivationCodeEmail;
    vm.clipboardFallback = clipboardFallback;
    vm.setQRCode = setQRCode;

    function activate() {
      HttpUtils.setTrackingID().then(function () {
        if (vm.otp === 'new') {
          return OtpService.generateOtp(vm.userName).then(function (otpObj) {
            vm.otp = otpObj;
            vm.timeLeft = moment(vm.otp.expiresOn).fromNow(true);
            setQRCode(vm.otp.code);
          });
        } else {
          vm.timeLeft = moment(vm.otp.expiresOn).fromNow(true);
          setQRCode(vm.otp.code);
        }
      });
    }

    function setQRCode(code) {
      if (angular.isDefined(code) && angular.toString(code).length > 0) {
        OtpService.getQrCodeUrl(code).then(function (qrcode) {
          var arrayData = '';
          for (var i in Object.keys(qrcode)) {
            if (qrcode.hasOwnProperty(i)) {
              arrayData += qrcode[i];
            }
          }
          vm.qrCode = arrayData;
        });
      }
    }

    function activateEmail() {
      vm.showEmail = true;
    }

    function clipboardFallback(copy) {
      $window.prompt($translate.instant('generateActivationCodeModal.clipboardFallback'), copy);
    }

    function sendActivationCodeEmail() {
      var entitleResult;
      var emailInfo = {
        'email': vm.email.to,
        'firstName': vm.email.to,
        'oneTimePassword': vm.otp.code,
        'expiresOn': vm.otp.expiresOn
      };

      ActivationCodeEmailService.save({}, emailInfo, function () {
        entitleResult = {
          msg: $translate.instant('generateActivationCodeModal.emailSuccess'),
          type: 'success'
        };

        Notification.notify([entitleResult.msg], entitleResult.type);

        if (angular.isDefined($state.modal) && angular.isFunction($state.modal.close)) {
          $state.modal.close();
        }
      }, function (error) {
        entitleResult = {
          msg: $translate.instant('generateActivationCodeModal.emailError') + "  " + error.data,
          type: 'error'
        };

        Notification.notify([entitleResult.msg], entitleResult.type);
      });
    }

    activate();
  }
})();
