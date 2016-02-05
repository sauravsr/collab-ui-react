'use strict';

describe('Squared Invite User and Assign Services User Flow', function () {

  var inviteEmail;

  it('should login as sqtest org admin and view users', function () {
    login.login('account-admin', '#/users');
  });

  it('should click on add users', function () {
    utils.click(users.addUsers);
    utils.expectIsDisplayed(users.manageDialog);
    utils.expectIsDisplayed(users.nextButton);
    utils.expectIsNotDisplayed(users.onboardButton);
    utils.expectIsNotDisplayed(users.entitleButton);
    utils.expectIsNotDisplayed(users.addButton);
  });

  describe('Add users through modal', function () {
    it('should add a user', function () {
      inviteEmail = utils.randomTestGmail();

      utils.click(users.clearButton);

      utils.click(users.nameAndEmailRadio);
      utils.sendKeys(users.firstName, 'first');
      utils.sendKeys(users.lastName, 'last');
      utils.sendKeys(users.emailAddress, inviteEmail);
      utils.click(users.plusIcon);
      utils.click(users.nextButton);

      utils.click(users.onboardButton);
      notifications.assertSuccess('onboarded successfully');
      utils.expectIsNotDisplayed(users.manageDialog);
    });

    it('should automatically close wizard', function () {
      utils.expectIsNotDisplayed(wizard.wizard);
    });

    it('should show invite pending status on new user', function () {
      utils.search(inviteEmail);
      utils.expectTextToBeSet(users.userListStatus, 'Invite Pending');
    });

    it('should add licenses successfully', function () {
      utils.clickUser(inviteEmail);
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
      utils.waitForModal().then(function () {
        //click on license checkbox
        utils.click(users.paidMsgCheckbox);
        utils.click(users.paidMtgCheckbox);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
        utils.click(users.closeSidePanel);
      });
    });

    it('should check if licenses saved successfully, then uncheck them', function () {
      utils.clickUser(inviteEmail);
      utils.expectIsDisplayed(users.servicesPanel);

      utils.expectIsDisplayed(users.messageService);
      utils.expectIsDisplayed(users.meetingService);

      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);
      utils.waitForModal().then(function () {
        utils.expectCheckbox(users.paidMsgCheckbox, true);
        utils.expectCheckbox(users.paidMtgCheckbox, true);

        // Uncheck licenses...
        utils.click(users.paidMsgCheckbox);
        utils.click(users.paidMtgCheckbox);
        utils.click(users.saveButton);
        notifications.assertSuccess('entitled successfully');
        utils.click(users.closeSidePanel);
      });
    });

    it('should check if licenses removed successfully', function () {
      utils.clickUser(inviteEmail);
      utils.expectIsDisplayed(users.servicesPanel);
      utils.click(users.servicesActionButton);
      utils.click(users.editServicesButton);

      utils.waitForModal().then(function () {
        utils.expectCheckbox(users.paidMsgCheckbox, false);
        utils.expectCheckbox(users.paidMtgCheckbox, false);
        utils.click(users.cancelButton);
        utils.expectIsNotDisplayed(users.manageDialog);
        utils.click(users.closeSidePanel);
      });
    });

    afterAll(function () {
      deleteUtils.deleteUser(inviteEmail);
    });
  });
});
