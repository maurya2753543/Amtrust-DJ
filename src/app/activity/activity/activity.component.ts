import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { ActivityRequest } from 'src/app/activity/activity/models/activity.request';
import { AgentDetails } from 'src/app/activity/activity/models/agent.details';
import { AppConstants } from 'src/app/app.constants';
import { NgxSpinnerService } from 'ngx-spinner';
import { ResponseObject } from 'src/app/model/response.object';
import { ClaimConstants } from '../../claim/claim.constants';
import { ActivityLogs } from 'src/app/activity/activity/models/activity.logs';


@Component({
  selector: 'app-activity-new',
  templateUrl: './activity.component.html',
  styleUrls: ['./acitvity.component.scss']
})
export class ActivityComponent implements OnInit {
  editTempActivityDetails: ActivityLogs;
  @Input() public relatedId: string;
  @Input() public activityType: string;
  activityLogResponse: ActivityLogs[] = [];
  activityLogResponseTemp: ActivityLogs[] = [];
  noMoreActivity: boolean = false;
  showMoreText: boolean = true;
  activityLogResponseItem: ActivityLogs = {
    activityDetails: {
      subject: '',
      status: {
        name: '',
        code: ''
      },
      email: '',
      priority: {
        name: '',
        code: ''
      },
      typeToConnect: {
        name: '',
        code: ''
      },
      description: '',
      isEditable: true
    },
    activityId: '',
    agentDetails: [{
      agentId: '',
      name: '',
      email: '',
      role: '',
      dateTimeDetails: {
        insertDate: '',
        insertTime: '',
        updateDate: '',
        updateTime: ''
      }
    }],
    dateTimeDetails: {
      insertDate: '',
      insertTime: '',
      updateDate: '',
      updateTime: ''
    }

  };
  statuses: any[] = [];
  priorities: any[] = [];
  typeOfConnects: any[] = [];
  panelOpenState = false;
  activityDesc: string;
  showAddNew: boolean = false;
  error: string;


  constructor(private service: AppService,
    private formBuilder: FormBuilder, private spinner: NgxSpinnerService) {
  }

  ngOnInit() {
    this.activityLogResponse = [];
    this.getConstants();
    this.showPreviousActivityLog();
  }

  getConstants() {
    this.service.getConstantsRequest(this.activityType).subscribe(
      res => {
        res as ResponseObject;

        if (res.status === 'OK') {
          this.statuses = res.content.claimConstants.activitStatusConstant.statusConstants;
          this.priorities = res.content.claimConstants.priorityConstants.priorities;
          this.typeOfConnects = res.content.claimConstants.typeOfConnectConstant.typeOfConnects;
        } else {
          if (res.status === 'ERROR') {
            if (res.content.code === '200.100') {
              this.service.showInfo(ClaimConstants.ERROR_MSG, 'In Activity Constants ');
              this.spinner.hide();
              return;
            } else {
              this.service.showInfo(res.content.message, res.content.error);
              this.spinner.hide();
              return;
            }
          }
        }
      });
  }

  hasError(controlName: string, errorName: string) {
    if (errorName == 'required' && !controlName) {
      return true;
    } else {
      return false;
    }

  }


  addNewActivity() {
    this.activityLogResponseItem = {
      activityDetails: {
        subject: '',
        status: {
          name: 'New',
          code: 'AS_001'
        },
        email: '',
        priority: {
          name: 'Not Selected',
          code: 'NA'
        },
        typeToConnect: {
          name: 'Not Selected',
          code: 'TOC_006'
        },
        description: '',
        isEditable: true
      },
      activityId: '',
      agentDetails: [{
        agentId: '',
        name: '',
        email: '',
        role: '',
        dateTimeDetails: {
          insertDate: '',
          insertTime: '',
          updateDate: '',
          updateTime: ''
        }
      }, {
        agentId: '',
        name: '',
        email: '',
        role: '',
        dateTimeDetails: {
          insertDate: '',
          insertTime: '',
          updateDate: '',
          updateTime: ''
        }
      }],
      dateTimeDetails: {
        insertDate: '',
        insertTime: '',
        updateDate: '',
        updateTime: ''
      }
    };
    this.activityLogResponse.unshift(this.activityLogResponseItem);
    this.showAddNew = true;
  }

  cancelActivity(i: number) {
    if (this.activityLogResponse[i].activityId != '') {
      this.activityLogResponse[i] = this.editTempActivityDetails;
      this.activityLogResponse[i].activityDetails.isEditable = false;
    } else {
      this.activityLogResponse.shift();
    }
  }

  isvalidated(activityLog): boolean {
    if (activityLog.activityDetails.subject) {
      return true;
    } else {
      this.service.showInfo('', 'Subject is required ');
      return false;
    }
  }

  saveActivity(activityLog: ActivityLogs) {
    if (this.isvalidated(activityLog)) {
      let agentDetails: AgentDetails = {
        name: sessionStorage.getItem(AppConstants.LOGGED_IN_USER),
        email: '',
        agentId: sessionStorage.getItem(AppConstants.GROUP),
        role: sessionStorage.getItem(AppConstants.ROLE),
        dateTimeDetails: {
          insertDate: '',
          insertTime: '',
          updateDate: '',
          updateTime: ''
        }
      };


      let activityRequest = {
        subject: activityLog.activityDetails.subject,
        email: activityLog.activityDetails.email,
        statusCode: activityLog.activityDetails.status.code,
        priorityCode: activityLog.activityDetails.priority.code,
        activityType: this.activityType,
        agentDetails: agentDetails,
        typeToConnectCode: activityLog.activityDetails.typeToConnect.code,
        description: activityLog.activityDetails.description,
        relatedId: this.relatedId
      };

      this.spinner.show();
      if (activityLog.activityId == '') {
        this.saveActivityRequestAPI(activityRequest);
      } else {
        this.updateActivityRequestAPI(activityRequest, activityLog.activityId);
      }
    }
  }

  saveActivityRequestAPI(activityRequest: ActivityRequest) {
    this.service.saveActivityRequest(activityRequest).subscribe(
      res => {
        res as ResponseObject;
        if (res.status === 'OK') {
          setTimeout(() => {
            this.showPreviousActivityLog();
          }, 2000);

          this.showAddNew = false;
        } else {
          if (res.status === 'ERROR') {
            if (res.content.code === '200.100') {
              this.service.showInfo(ClaimConstants.ERROR_MSG, 'In  Saving Activity ');
              this.spinner.hide();
              return;
            } else {
              this.service.showInfo(res.content.message, res.content.error);
              this.spinner.hide();
              return;
            }
          }
        }
      }, err => {
        this.error = err;
      }
    );

  }

  updateActivityRequestAPI(activityRequest: ActivityRequest, activityId: string) {
    this.service.updateActivityRequest(activityRequest, activityId).subscribe(
      res => {
        res as ResponseObject;
        if (res.status === 'OK') {
          this.showPreviousActivityLog();
          this.showAddNew = false;
        } else {
          if (res.status === 'ERROR') {
            if (res.content.code === '200.100') {
              this.spinner.hide();
              this.service.showInfo(ClaimConstants.ERROR_MSG, 'In  Saving Activity ');
              return;
            } else {
              this.service.showInfo(res.content.message, res.content.error);
              this.spinner.hide();
              return;
            }
          }
        }
      }, err => {
        this.error = err;
        this.spinner.hide();
      }
    );

  }

  showMore(itemCount) {

    if (this.activityLogResponseTemp.length) {
      if (this.activityLogResponseTemp.length < 3) {
        itemCount = this.activityLogResponseTemp.length;
      }
      let i;
      for (i = 0; i < itemCount; i++) {
        if (this.activityLogResponseTemp[0] != undefined || this.activityLogResponseTemp[0] != null) {
          this.noMoreActivity = false;
          this.activityLogResponse.push(this.activityLogResponseTemp[0]);
          this.activityLogResponseTemp.shift();
        } else {
          this.noMoreActivity = true;
          break;
        }
      }
    }
  }

  showPreviousActivityLog() {

    this.service.getActivityLog(this.relatedId, this.activityType).subscribe(res => {

      if (res.status === 'OK') {

        this.activityLogResponse = [];
        let activityLogTemp: ActivityLogs[] = [];
        activityLogTemp = res.content as ActivityLogs[];

        for (let i = 0; i < activityLogTemp.length; i++) {
          activityLogTemp[i].activityDetails['isEditable'] = false;
          activityLogTemp[i].activityDetails['isShowMore'] = true;

        }
        this.activityLogResponseTemp = [...activityLogTemp];
        this.showMore(3);
      } else {
        if (res.status === 'ERROR') {
          if (res.content.code === '200.100') {
            this.service.showInfo(ClaimConstants.ERROR_MSG, 'In  Fetching Activity ');
            return;
          } else {
            this.service.showInfo(res.content.message, res.content.error);
            return;
          }
        }
        this.spinner.hide();
      }
    }, err => {
      this.error = err;
      this.spinner.hide();
    }
    );
    this.spinner.hide();
  }

  editActivity(i: number) {
    if (this.activityLogResponse[i].activityId != '') {
      this.editTempActivityDetails = JSON.parse(JSON.stringify(this.activityLogResponse[i]));
    }
    this.activityLogResponse[i].activityDetails.isEditable = true;
  }

}
