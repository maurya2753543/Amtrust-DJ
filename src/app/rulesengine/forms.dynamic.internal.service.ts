import {ControlsFields} from '../claim/create-claim/controls.fiels';
import {Injectable, OnInit} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import {ControlNameForField} from './model/control.name-for.field.name';

@Injectable({providedIn: 'root'})
export class DynamicFormChangeInternalService implements OnInit {
  formType: string;
  genericForm: FormGroup;
  controlsFields: ControlsFields[] = [];
  mapControlNameForField: ControlNameForField [] = this.loadControlNameForField();

  ngOnInit(): void {

  }

  //Map the controller name with field name
  loadControlNameForField(): ControlNameForField [] {
    let mapControlNameForFieldTemp: ControlNameForField[] = [{
      controlName: 'excessFee',
      forField: 'excessFee'
    }];
    return mapControlNameForFieldTemp;
  }

  //Hold the parent child relationship between parents from group and controls name
  loadFormAsObject(genericForm: FormGroup) {
    this.genericForm = genericForm;
    this.controlsFields = [];
    //Map the form control field in parent child relation ship - not in use at present
    /*Object.keys(this.genericForm.controls).forEach((element) => {
        let controlsFields:ControlsFields = new ControlsFields();
        controlsFields.name = element;
        this.controlsFields.push(controlsFields);
        let formControlsTemp = this.genericForm.controls[element];
        let formControlsFieldChild:string[]=[];
        Object.keys(formControlsTemp['controls']).forEach((item) => {
            formControlsFieldChild.push(item);
        });
        controlsFields.child = formControlsFieldChild;
    });*/
  }

  //Set validator dynamically on any field - Not in use at present
  setValidatorsOnFormForField(forField: string, failureMsg: string) {
    let controlName = this.getFormControlName(forField);
    let parentChildControlName = this.controlsFields.filter(x => x.child.filter(c => c == controlName)[0])[0];
    console.log('show vlaue', this.genericForm.controls[parentChildControlName.name]['controls'][controlName]);
    this.genericForm.controls[parentChildControlName.name]['controls'][controlName].setValidators(Validators.required);
    console.log('show vlaue', this.genericForm.controls[parentChildControlName.name]['controls'][controlName]);
  }

  //Not using at present
  getFormControlName(forField: string): string {
    let resultMap: ControlNameForField = this.mapControlNameForField.filter(x => x.forField == forField)[0];
    return resultMap.controlName;
  }

  // Temproray Method to set validators
  setValidatorsOnClaim(forField: string) {
    switch (forField) {
      case 'excessFee': {
        const excessFeeControls = this.genericForm['controls'].paymentDetails['controls'].excessFee;
        excessFeeControls.setValue(null);
        excessFeeControls.setValidators(Validators.required);
        excessFeeControls.updateValueAndValidity();
        break;
      }
    }
  }

  //Temprory method to set default value
  setDefaultsValueOnClaim(forField: string, valueToSet: string) {
    switch (forField) {
      case 'statusCode': {
        if (this.formType == 'CREATE') {
          const statusControls = this.genericForm['controls'].claimStatusPanel['controls'].status;
          if (statusControls.value == '') {
            statusControls.setValue(valueToSet);
            statusControls.updateValueAndValidity();
          }

          break;
        } else if (this.formType == 'UPDATE') {
          //No need to set the default value in update claim form
          /*const statusControls = this.genericForm['controls'].claimStatusPanel['controls'].statusCode
          if(statusControls.value == ""){
              statusControls.setValue(valueToSet);
              statusControls.updateValueAndValidity();
          }*/
          break;
        }
      }
      case 'subStatusCode': {
        if (this.formType == 'CREATE') {
          const subStatusControls = this.genericForm['controls'].claimStatusPanel['controls'].claimSubStatus;
          if (subStatusControls.value == '') {
            subStatusControls.setValue(valueToSet);
            subStatusControls.updateValueAndValidity();
          }
          break;
        } else if (this.formType == 'UPDATE') {
          //No need to set the default value in update claim form
          /* const subStatusControls = this.genericForm['controls'].claimStatusPanel['controls'].subStatusCode
           if(subStatusControls.value == ""){
               subStatusControls.setValue(valueToSet);
               subStatusControls.updateValueAndValidity();
           }
           break;*/
        }
      }
    }

  }
}
