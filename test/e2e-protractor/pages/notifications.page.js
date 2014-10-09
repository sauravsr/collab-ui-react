'use strict'

var Notifications = function(){
  this.errorAlert = element(by.css('.alertify-log-error'));
  this.errorBody = element(by.css('.panel-danger-body p'));
  this.successAlert = element(by.css('.alertify-log-success'));
  this.successBody = element(by.css('.panel-success-body p'));

  this.notificationCancel = element(by.id('notifications-cancel'));

  this.assertError = function(msg1, msg2){
    utils.expectIsDisplayed(this.errorAlert);
    this.errorAlert.click();
    if (msg1){
      expect(this.errorBody.getText()).toContain(msg1);
    }
    if (msg2){
      expect(this.errorBody.getText()).toContain(msg2);
    }
    this.notificationCancel.click();
  };

  this.assertSuccess = function(msg1, msg2){
    utils.expectIsDisplayed(this.successAlert);
    this.successAlert.click();
    if (msg1){
      expect(this.successBody.getText()).toContain(msg1);
    }
    if (msg2) {
      expect(this.successBody.getText()).toContain(msg2);
    }
    this.notificationCancel.click();
  };
}

module.exports = Notifications;

