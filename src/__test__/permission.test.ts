import { IItemPermissions, validateInsert } from '../index'

const permissions: IItemPermissions = {
  select: {
    filter: { _and: [{ id: { _nin: [] } }, { data_type_id: { _gte: 'X-Hasura-User-Id' } }] },
    columns: ['data_type_id'],
    allow_aggregations: true
  },
  update: {
    set: { id: 'dew' },
    filter: { _and: [{ id: { _nin: [] } }, { data_type_id: { _gte: 'X-Hasura-User-Id' } }] },
    columns: ['source_id']
  },
  delete: { filter: { _and: [{ id: { _nin: [] } }, { data_type_id: { _gte: 'X-Hasura-User-Id' } }] } },
  insert: {
    set: { class_id: '2fwefew', source_id: 'x-hasura-Role-Id' },
    check: {
      _and: [
        { encounter_type_concepts: { id: { _ne: 'X-Hasura-User-Id' } } },
        { data_type_id: { _gte: 'X-Hasura-User-Id' } }
      ]
    },
    columns: ['class_id', 'data_type_id']
  }
}
const newObject: any = {
  class_id: '2fwefew',
  data_type_id: '45677',
  encounter_type_concepts: {
    id: '12345'
  }
}
const environment: any = {
  'X-Hasura-User-Id': '1234'
}
test('insert', () => {
  expect(validateInsert(newObject, permissions.insert, environment)).toBeTruthy()
})
