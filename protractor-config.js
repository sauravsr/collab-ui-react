'use strict';

var HttpsProxyAgent = require("https-proxy-agent");
var touch = require('touch');
var fs = require('fs');
var e2eFailNotify = '.e2e-fail-notify';

// http proxy agent is required if the host running the 'e2e' task is behind a proxy (ex. a Jenkins slave)
// - sauce executors are connected out to the world through the host's network
// - and at the end of each spec run, a connection back to sauce is made to report results
var agent = mkProxyAgent();

var TIMEOUT      = 1000 * 60;
var LONG_TIMEOUT = 1000 * 60 * 2;
var VERY_LONG_TIMEOUT = 1000 * 60 * 5;

exports.config = {
  framework: "jasmine2",

  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  sauceAgent: process.env.SAUCE_USERNAME ? agent : undefined,
  directConnect: process.env.SAUCE_USERNAME ? false : true,

  capabilities: {
    'browserName': 'chrome',
    "screenResolution": "1680x1050",
    'platform': process.env.SAUCE_USERNAME ? 'Windows 7' : undefined,
    'tunnelIdentifier': process.env.SC_TUNNEL_IDENTIFIER,
    'name': 'wx2-admin-web-client',
    'build': process.env.BUILD_NUMBER,

    'chromeOptions': {
      //'args': ['--disable-extensions', '--start-fullscreen']
      'args': ['--disable-extensions', '--window-position=0,0', '--window-size=1280,900']
    },
    shardTestFiles: true,
    maxInstances: process.env.SAUCE_MAX_INSTANCES ? process.env.SAUCE_MAX_INSTANCES : process.env.SAUCE_USERNAME ? 10 : 1
  },

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: process.env.LAUNCH_URL || 'http://127.0.0.1:8000',

  onPrepare: function() {
    var FailFast = function(){
      this.suiteStarted = function(suite){
        if (fs.existsSync(e2eFailNotify)){
            console.log('fail file exists');
        }
      };

      this.specStarted = function(spec){
        if (fs.existsSync(e2eFailNotify)){
            env.specFilter = function(spec) {
              return false;
            };
        }
      };

      this.specDone = function(spec) {
        if (spec.status === 'failed' && browser.params.isFailFast === 'true') {
            touch(e2eFailNotify);
        }
      };
    }

    jasmine.getEnv().addReporter(new FailFast());
    browser.ignoreSynchronization = true;

    global.isProductionBackend = browser.params.isProductionBackend === 'true';

    global.log = new Logger();

    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(
      new jasmineReporters.JUnitXmlReporter({
        savePath:'test/e2e-protractor/reports',
        consolidateAll: false
      })
    );

    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(
      new SpecReporter({
        displayStacktrace: true,
        displaySpecDuration: true
      })
    );

    global.TIMEOUT = TIMEOUT;
    global.LONG_TIMEOUT = LONG_TIMEOUT;

    global.baseUrl = exports.config.baseUrl;

    global.helper = require('./test/api_sanity/test_helper');

    global.utils = require('./test/e2e-protractor/utils/test.utils.js');
    global.deleteUtils = require('./test/e2e-protractor/utils/delete.utils.js');
    global.config = require('./test/e2e-protractor/utils/test.config.js');
    global.deleteTrialUtils = require('./test/e2e-protractor/utils/deleteTrial.utils.js');

    global._ = require('lodash');

    var Navigation = require('./test/e2e-protractor/pages/navigation.page.js');
    var Notifications = require('./test/e2e-protractor/pages/notifications.page.js');
    var UsersPage = require('./test/e2e-protractor/pages/users.page.js');
    var LoginPage = require('./test/e2e-protractor/pages/login.page.js');
    var LandingPage = require('./test/e2e-protractor/pages/landing.page.js');
    var ManagePage = require('./test/e2e-protractor/pages/manage.page.js');
    var ReportsPage = require('./test/e2e-protractor/pages/reports.page.js');
    var SupportPage = require('./test/e2e-protractor/pages/support.page.js');
    var CdrPage = require('./test/e2e-protractor/pages/cdr.page.js');
    var SSOWizardPage = require('./test/e2e-protractor/pages/ssowizard.page.js');
    var DirSyncWizardPage = require('./test/e2e-protractor/pages/dirsync.page.js');
    var InvitePage = require('./test/e2e-protractor/pages/invite.page.js');
    var DownloadPage = require('./test/e2e-protractor/pages/download.page.js');
    var ActivatePage = require('./test/e2e-protractor/pages/activate.page.js');
    var SpacesPage = require('./test/e2e-protractor/pages/spaces.page.js');
    var CallRoutingPage = require('./test/e2e-protractor/pages/callrouting.page.js');
    var AutoAttendantPage = require('./test/e2e-protractor/pages/autoattendant.page.js');
    var PartnerHomePage = require('./test/e2e-protractor/pages/partner.page.js');
    var TelephonyPage = require('./test/e2e-protractor/pages/telephony.page.js');
    var PartnerPage = require('./test/e2e-protractor/pages/partner.page.js');
    var FirstTimeWizard = require('./test/e2e-protractor/pages/wizard.page.js');
    var ServiceSetup = require('./test/e2e-protractor/pages/servicesetup.page.js');
    var RolesPage = require('./test/e2e-protractor/pages/roles.page.js');
    var MeetingsPage = require('./test/e2e-protractor/pages/meetings.page.js');
    var BasicSettigsPage = require('./test/e2e-protractor/pages/webexbasicsettings.page.js');
    var SiteListPage = require('./test/e2e-protractor/pages/webexsitelist.page.js');
    var SiteSettigsPage = require('./test/e2e-protractor/pages/webexsitesettings.page.js');
    var SiteReportsPage = require('./test/e2e-protractor/pages/webexsitereports.page.js');
    var OrgProfilePage = require('./test/e2e-protractor/pages/orgprofile.page.js');
    var MediaServicePage = require('./test/e2e-protractor/pages/mediaService.page.js');
    var EnterpriseResourcePage = require('./test/e2e-protractor/pages/enterpriseResource.page.js');
    var UtilizationPage = require('./test/e2e-protractor/pages/utilization.page.js');
    var MeetingsPage = require('./test/e2e-protractor/pages/meetings.page.js');
    var TrialExtInterestPage = require('./test/e2e-protractor/pages/trialExtInterest.page.js');
    var InviteUsers = require('./test/e2e-protractor/pages/inviteusers.page.js');
    var HuronFeatures = require('./test/e2e-protractor/pages/huronFeatures.page.js');
    var HuntGroup = require('./test/e2e-protractor/pages/HuntGroup.page.js');
    var EnterEmailAddrPage = require('./test/e2e-protractor/pages/enterEmailAddr.page.js');
    var CreateAccountPage = require('./test/e2e-protractor/pages/createAccount.page.js');

    global.notifications = new Notifications();
    global.navigation = new Navigation();
    global.users = new UsersPage();
    global.login = new LoginPage();
    global.landing = new LandingPage();
    global.manage = new ManagePage();
    global.reports = new ReportsPage();
    global.support = new SupportPage();
    global.cdr = new CdrPage();
    global.ssowizard = new SSOWizardPage();
    global.disyncwizard = new DirSyncWizardPage();
    global.invite = new InvitePage();
    global.download = new DownloadPage();
    global.activate = new ActivatePage();
    global.spaces = new SpacesPage();
    global.callrouting = new CallRoutingPage();
    global.autoattendant = new AutoAttendantPage();
    global.partner = new PartnerHomePage();
    global.telephony = new TelephonyPage();
    global.partner = new PartnerPage();
    global.wizard = new FirstTimeWizard();
    global.servicesetup = new ServiceSetup();
    global.roles = new RolesPage();
    global.meetings = new MeetingsPage();
    global.usersettings = new BasicSettigsPage();
    global.sitelist = new SiteListPage();
    global.sitesettings = new SiteSettigsPage();
    global.sitereports = new SiteReportsPage();
    global.orgprofile = new OrgProfilePage();
    global.mediaservice = new MediaServicePage();
    global.enterpriseResource = new EnterpriseResourcePage();
    global.utilization = new UtilizationPage();
    global.meetings = new MeetingsPage();
    global.trialextinterest = new TrialExtInterestPage();
    global.inviteusers = new InviteUsers();
    global.huronFeatures = new HuronFeatures();
    global.huntGroup = new HuntGroup();
    global.enterEmailAddrPage = new EnterEmailAddrPage();
    global.createAccountPage = new CreateAccountPage();

    return browser.getCapabilities().then(function (capabilities) {
      if (capabilities.caps_.browserName === 'firefox') {
        browser.driver.manage().window().maximize();
      }
    });
  },

  jasmineNodeOpts: {
    onComplete: null,
    isVerbose: true,
    showColors: true,
    print: function() {},
    includeStackTrace: true,
    defaultTimeoutInterval: VERY_LONG_TIMEOUT
  },

  // The timeout for each script run on the browser. This should be longer
  // than the maximum time your application needs to stabilize between tasks.
  allScriptsTimeout: VERY_LONG_TIMEOUT
};

function Logger() {
  var lastLogMessage = '';
  var lastLogMessageCount = 0;

  function log(message) {
    if (log.verbose || browser.params.log === 'true') {
      if (lastLogMessage === message) {
        lastLogMessageCount++;
      } else {
        if (lastLogMessage && lastLogMessageCount) {
          console.log('(Repeated ' + lastLogMessageCount + ' times...)');
        }
        lastLogMessage = message;
        lastLogMessageCount = 0;
        console.log(message);
      }
    }
  }

  return log;
}

function mkProxyAgent () {
  if (process.env.SAUCE_ENABLE_WEB_PROXY === 'false') {
    return;
  }
  return new HttpsProxyAgent(process.env.http_proxy || 'http://proxy.esl.cisco.com:80');
}
