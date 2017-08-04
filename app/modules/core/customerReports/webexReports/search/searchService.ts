import * as moment from 'moment';

export class SearchService {
  private url;
  private data: any = {};

  /* @ngInject */
  constructor(
    private UrlConfig,
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.url = `${this.UrlConfig.getGeminiUrl()}`;
  }

  public getMeeting(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}`;
    return this.$http.get(url).then(this.extractData);
  }

  public getMeetings(data) {
    const url = `${this.url}meetings`;
    return this.$http.post(url, data).then(this.extractData);
  }

  public getMeetingDetail(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/session`;
    return this.$http.get(url).then(this.extractData);
  }

  public getParticipants(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/participants`;
    return this.$http.get(url).then(this.extractData);
  }

  public getJoinMeetingTime(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/participants/join-meeting-time`;
    return this.$http.get(url).then(this.extractData);
  }

  public getJoinMeetingQuality(conferenceID) {
    const url = `${this.url}meetings/${conferenceID}/participants/join-meeting-quality`;
    return this.$http.get(url).then(this.extractData);
  }

  public getStatus(num) {
    const statusArr = ['inProcess', 'ended'];
    return this.$translate.instant('webexReports.meetingStatus.' + statusArr[num - 1]);
  }

  private extractData(response) {
    return _.get(response, 'data');
  }

  public setStorage(key, val) {
    _.set(this.data, key, val);
    return this.data[key];
  }

  public getStorage(key) {
    return _.get(this.data, key);
  }

  public formateDate(date) {
    const timeZone: any = this.getStorage('timeZone');
    return date ? moment(date).tz(timeZone).format('MMMM Do, YYYY h:mm:ss A') : '';
  }
}
