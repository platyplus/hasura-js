import { IFilter, validateFilter } from './filters'
export { validateFilter }

interface IFilterPermission {
  filter: IFilter
}

interface ISetPermission {
  set: IFilter
}
interface IColumnPermission {
  columns: string[]
}

interface IInsertPermission extends ISetPermission, IColumnPermission {
  check: IFilter
}
interface ISelectPermission extends IColumnPermission, IFilterPermission {
  allow_aggregations?: boolean
}
interface IUpdatePermission extends ISetPermission, IColumnPermission, IFilterPermission {}
// tslint:disable-next-line: no-empty-interface
interface IDeletePermission extends IFilterPermission {}

export interface IItemPermissions {
  insert: IInsertPermission
  select: ISelectPermission
  update: IUpdatePermission
  delete: IFilterPermission
}

export const validateInsert = (value: any, permission: IInsertPermission, environment: any): boolean => {
  return validateFilter(value, permission.check, environment)
}

export const validateUpdate = (value: any, permission: IUpdatePermission, environment: any): boolean => {
  return validateFilter(value, permission.filter, environment)
}

export const validateDelete = (value: any, permission: IDeletePermission, environment: any): boolean => {
  return validateFilter(value, permission.filter, environment)
}
