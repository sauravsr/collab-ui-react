/**
 * Created by sjalipar on 11/4/15.
 */
'use strict';

describe('Admin should be able to', function () {

  beforeAll(function () {
    login.login('huron-int1', '#/hurondetails/features');
  }, 120000);

  it('should open features modal pop up', function () {
    utils.expectIsDisplayed(huronFeatures.newFeatureBtn);
    utils.click(huronFeatures.newFeatureBtn);
  });

  it('go to huntgroup create page', function () {
    utils.expectIsDisplayed(huntGroup.huntGroupBtn);
    utils.click(huntGroup.huntGroupBtn);
    utils.expectTextToBeSet(huntGroup.huntGroupCreateTitle, 'Create Hunt Group');
  });

  it('set the name of the hunt group', function () {
    utils.expectTextToBeSet(huntGroup.hint, 'This hunt group name will also be the name callers see on their device (i.e. alerting name)');
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.randomHGName);
    utils.click(huntGroup.rightBtn);
  });

  it('select pilot numbers of hunt groups', function () {
    utils.expectTextToBeSet(huntGroup.description, 'When this number is called, this hunt group is activated');
    utils.sendKeys(huntGroup.pilotTypeAheadInput, huntGroup.pilotNumber);
    utils.expectTextToBeSet(huntGroup.dropdownItem, huntGroup.pilotNumber);
    utils.click(huntGroup.dropdownItem);
  });

  it('go to the hunting method section', function () {
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.hgmethodsTitle, 'Select Hunting Method');
    utils.click(huntGroup.huntMethod);
    utils.click(huntGroup.huntMethod);
  });

  it('go to the hunt members section', function () {
    utils.expectTextToBeSet(huntGroup.description, 'These are the users who pickup the hunt group calls');
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.member1Search);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.member1Search);
    utils.click(huntGroup.memberDropdownItem);
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.member2Search);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.member2Search);
    utils.click(huntGroup.memberDropdownItem);
  });

  it('go to the fallback destination section', function () {
    utils.click(huntGroup.rightBtn);
    utils.expectTextToBeSet(huntGroup.description, 'This is where the call goes if it was not answered by this hunt group');
  });

  it('the form should be disabled', function () {
    navigation.hasClass(huntGroup.submitBtn, 'disabled');
  });

  it('enable the create hunt group button', function () {
    utils.sendKeys(huntGroup.typeAheadInput, huntGroup.member2Search);
    utils.expectTextToBeSet(huntGroup.memberDropdownItemName, huntGroup.member2Search);
    utils.click(huntGroup.memberDropdownItem);
  });

  it('should be to click on the create hunt group btn', function () {
    navigation.hasClass(huntGroup.submitBtn, 'success');
    utils.click(huntGroup.submitBtn);
  });

  it('should be able to see success notification of hunt group creation', function () {
    notifications.assertSuccess(huntGroup.randomHGName + ' hunt group has been created successfully');
  });

  it('see the searched hunt group', function () {
    utils.click(huronFeatures.allFilter);
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huntGroup.randomHGName);
    utils.expectIsDisplayed(huronFeatures.huntGroups);
    utils.expectTextToBeSet(huronFeatures.selectedHuntGroup, huntGroup.randomHGName);
  });

  it('see the edit button when clicked on menu button of a selected hunt group', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupEditBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupEditBtn);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupDeleteBtn);
  });

  it('click on the edit btn on the hunt group card', function () {
    utils.click(huronFeatures.huntGroupEditBtn);
    utils.expectText(huntGroup.editPageTitle, huntGroup.randomHGName);
  });

  it('change the hunt group name on hunt group edit page', function () {
    utils.expectIsDisplayed(huntGroup.editHgName);
    utils.expectValueToBeSet(huntGroup.editHgName, huntGroup.randomHGName);
    utils.clear(huntGroup.editHgName);
    utils.sendKeys(huntGroup.editHgName, huntGroup.modifiedHGName);
    utils.expectValueToBeSet(huntGroup.editHgName, huntGroup.modifiedHGName);
    utils.clear(huntGroup.editHgName);
    utils.sendKeys(huntGroup.editHgName, huntGroup.randomHGName);
    utils.expectValueToBeSet(huntGroup.editHgName, huntGroup.randomHGName);
  });

  it('click on the cancel btn of cancel/save bar on edit page', function () {
    utils.clear(huntGroup.editHgName);
    utils.sendKeys(huntGroup.editHgName, huntGroup.modifiedHGName);
    utils.expectIsDisplayed(huntGroup.cancelBtn);
    utils.click(huntGroup.cancelBtn);
  });

  it('remove the hunt group number', function () {
    utils.expectIsDisplayed(huntGroup.hgNumbers);
    utils.click(huntGroup.hgNumbers);
    utils.expectIsDisplayed(huntGroup.hgNumber1);
    utils.click(huntGroup.hgNumber1);
  });

  it('not click on the disabled save btn, when they are any changes in hunt group edit page', function () {
    utils.expectIsDisplayed(huntGroup.cancelSaveBar);
    utils.expectIsDisabled(huntGroup.saveBtn);
  });

  it('add hunt group numbers by using the number functionality', function () {
    utils.expectIsDisplayed(huntGroup.numSearchFilter);
    utils.clear(huntGroup.numSearchFilter);
    utils.sendKeys(huntGroup.numSearchFilter, huntGroup.pilotNumber);
    utils.expectIsDisplayed(huntGroup.searchedNumber1);
    utils.click(huntGroup.searchedNumber1);
    utils.click(huntGroup.hgNumbers);
  });

  it('configure the hunt members max ring time', function () {
    utils.expectIsDisplayed(huntGroup.memberMaxRingTimeElmnt);
    utils.click(huntGroup.memberMaxRingTimeElmnt);
    utils.expectIsDisplayed(huntGroup.memberMaxRingTime);
    utils.click(huntGroup.memberMaxRingTime);
  });

  it('configure the caller max wait time', function () {
    utils.expectIsDisplayed(huntGroup.callerMaxWaitTimeElmnt);
    utils.click(huntGroup.callerMaxWaitTimeElmnt);
    utils.expectIsDisplayed(huntGroup.callerMaxWaitTime);
    utils.click(huntGroup.callerMaxWaitTime);
  });

  it('change the hunt method', function () {
    utils.expectIsDisplayed(huntGroup.oldHuntMethod);
    utils.expectIsDisplayed(huntGroup.newHuntMethod);
    utils.click(huntGroup.newHuntMethod);
  });

  it('see the cancel/save bar when any changes are there on edit page', function () {
    utils.expectIsDisplayed(huntGroup.cancelSaveBar);
    utils.expectTextToBeSet(huntGroup.cancelSaveBar, "Do you want to save your changes?");
  });

  it('search a member', function () {
    utils.expectIsDisplayed(huntGroup.memberSearch);
    utils.clear(huntGroup.memberSearch);
    utils.sendKeys(huntGroup.memberSearch, huntGroup.member3Search);
  });

  it('add a search member to the hunt group', function () {
    utils.expectIsDisplayed(huntGroup.searchedMemeber);
    utils.click(huntGroup.searchedMemeber);
  });

  it('remove an user from the hunt group', function () {
    utils.expectIsDisplayed(huntGroup.addedMember);
    utils.expectText(huntGroup.addedMemberName, huntGroup.member3Search);
    utils.click(huntGroup.addedMember);
    utils.expectIsDisplayed(huntGroup.removeAddedMember);
    utils.click(huntGroup.removeAddedMember);
    utils.expectNotText(huntGroup.addedMemberName, huntGroup.member3Search);
  });

  it('click on the save btn of cancel/save bar and changes to be reflected on edit page', function () {
    utils.expectIsDisplayed(huntGroup.cancelSaveBar);
    utils.click(huntGroup.saveBtn);
    notifications.assertSuccess(huntGroup.randomHGName + ' hunt group has been updated successfully');

  });

  it('click on the back button of hunt group edit page', function () {
    utils.expectIsDisplayed(huntGroup.backBtn);
    utils.click(huntGroup.backBtn);
  });

  it('see the searched hunt group after editing', function () {
    utils.click(huronFeatures.allFilter);
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huntGroup.randomHGName);
    utils.expectIsDisplayed(huronFeatures.huntGroups);
    utils.expectTextToBeSet(huronFeatures.selectedHuntGroup, huntGroup.randomHGName);
  });

  it('see the delete button when clicked on menu button of a selected hunt group', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupEditBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupEditBtn);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsEnabled(huronFeatures.huntGroupDeleteBtn);
  });

  it('see the delete pop up when clicked on delete button of a selected hunt group', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeletePopUp);
  });

  it('click on close button of delete hunt group pop up', function () {
    utils.expectIsDisplayed(huronFeatures.closeBtnOnModal);
    utils.click(huronFeatures.closeBtnOnModal);
  });

  it('click on cancel button of delete hunt group pop up', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.popUpCancelBtn);
  });

  it('click on delete button of delete hunt group pop up', function () {
    utils.expectIsDisplayed(huronFeatures.huntGroupMenu);
    utils.click(huronFeatures.huntGroupMenu);
    utils.expectIsDisplayed(huronFeatures.huntGroupDeleteBtn);
    utils.click(huronFeatures.huntGroupDeleteBtn);
    utils.expectIsDisplayed(huronFeatures.popUpDelteBtn);
    utils.click(huronFeatures.popUpDelteBtn);
    notifications.assertSuccess(huntGroup.randomHGName + ' hunt group has been deleted successfully');
  });

  it('verify the deleted hunt group is not shown on features list page', function () {
    utils.click(utils.searchbox);
    utils.clear(utils.searchField);
    utils.sendKeys(utils.searchField, huntGroup.randomHGName);
    utils.expectIsNotDisplayed(huronFeatures.huntGroups);
  });

});
