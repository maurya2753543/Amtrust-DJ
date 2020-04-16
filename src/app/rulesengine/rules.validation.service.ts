import {Injectable} from '@angular/core';
import {ProductRules} from './model/product.rules';
import {AppService} from '../app.service';
import {PolicyField} from './model/policy.fields';
import {ClaimField} from './model/claim.field';
import {RuleContaningFields} from './model/rule.contaning.fields';
import {RuleResult} from './model/rule.result';
import {FormGroup} from '@angular/forms';
import {DynamicFormChangeInternalService} from './forms.dynamic.internal.service';


@Injectable({providedIn: 'root'})
export class RulesValidationService {
  jexl: any;
  private productRule: ProductRules[];
  private ruleResult: RuleResult;

  constructor(public appService: AppService, public dynamicFormsChangesService: DynamicFormChangeInternalService) {
    this.jexl = require('jexl');
    this.ruleResult = {
      valid: false,
      claimField: null,
      policyField: null,
    };
  }

  public setClaimForm(claimForm: FormGroup, formType: string) {
    this.dynamicFormsChangesService.formType = formType;
    this.dynamicFormsChangesService.loadFormAsObject(claimForm);
  }

  loadProductRulesByProductCode(productCode: string) {
    this.productRule = [];
    this.appService.getProductRuleByProductCode(productCode).subscribe(res => {
      this.productRule = res as ProductRules[];
      this.validationWithRule(null);
    });
  }

  validationWithRule(rulesContaningField: RuleContaningFields) {
    this.productRule.forEach(productRule => {
      if (productRule.ruleType == 'Validation') {
        if (rulesContaningField != null) {
          this.validateValidationRule(rulesContaningField, productRule);
        }
      } else if (productRule.ruleType == 'Action') {
        this.validationActionRule(rulesContaningField, productRule);
      } else if (productRule.ruleType == 'DelegateAction') {
        this.validationDelegateActionRule(rulesContaningField, productRule);
      } else if (productRule.ruleType == 'Default') {
        if (rulesContaningField == null) {
          this.setDefaultByRule(rulesContaningField, productRule);
        }
      }
    });
  }

  setDefaultByRule(rulesContaningField: RuleContaningFields, productRule: ProductRules) {
    if (productRule.forType == 'CLAIM') {
      let valueToSet = productRule.expression.split('==')[1];
      this.dynamicFormsChangesService.setDefaultsValueOnClaim(productRule.forField, valueToSet);
    } else if (productRule.forType == 'POLICY') {

    }

  }


  validationActionRule(rulesContaningField: RuleContaningFields, productRule: ProductRules) {


  }

  validationDelegateActionRule(rulesContaningField: RuleContaningFields, productRule: ProductRules) {


  }

  validateValidationRule(rulesContaningField: RuleContaningFields, productRule: ProductRules) {
    let validationResult = null;
    if (productRule.forType == 'CLAIM') {
      if (rulesContaningField.claimField != null) {
        let claimFieldForExp: ClaimField = {
          statusCode: rulesContaningField.claimField.statusCode,
          subStatusCode: rulesContaningField.claimField.subStatusCode,
          excessFee: rulesContaningField.claimField.excessFee,
          diagnosticOutcome: rulesContaningField.claimField.diagnosticOutcome,

        };

        validationResult = this.jexl.evalSync(productRule.expression, claimFieldForExp);
        if (validationResult == true) {
          this.ruleResult.valid = true;
          //this.appService.showInfo("", productRule.failureMsg);
          this.dynamicFormsChangesService.setValidatorsOnClaim(productRule.forField);
        }
      } else {
        this.appService.showInfo('Validation', 'Please provide the claim object to validate');
        this.ruleResult.valid = true;
      }

    } else if (productRule.forType == 'POLICY') {
      if (rulesContaningField.policyField != null) {
        let policyFieldForExp: PolicyField = {
          excesss: ''
        };
        validationResult = this.jexl.evalSync(productRule.expression, policyFieldForExp);

      } else {
        this.appService.showInfo('Validation', 'Please provide the policy object to validate');
        this.ruleResult.valid = true;
      }
    }

  }

  getRuleResult(): RuleResult {
    return this.ruleResult;
  }

}
