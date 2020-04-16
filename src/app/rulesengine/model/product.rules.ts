import {Expression} from './expression';

export interface ProductRules {
  ruleCode: string;
  sequence: number;
  resultType: string;
  expression: string;
  ruleType: string;
  forType: string;
  delegateAction: string;
  affectedProperties: string;
  expressions: Expression;
  failureMsg: string;
  forField: string;
  info: string;
  pre: boolean
}
