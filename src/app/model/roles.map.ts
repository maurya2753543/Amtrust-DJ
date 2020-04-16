import {RoleEnum} from './roles.enum';

export class RoleMap {
  public roleMap: any;

  constructor() {
    this.roleMap = new Map<String, Number>();
    this.roleMap.set('Upload', RoleEnum.Upload);
    this.roleMap.set('Create', RoleEnum.Create);
    this.roleMap.set('Update', RoleEnum.Update);
    this.roleMap.set('Read', RoleEnum.Read);
  }
}
