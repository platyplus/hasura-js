import { generateSqlConstraints, validateFilter } from '../filters'
import { IItemPermissions, validateDelete, validateInsert, validateUpdate } from '../index'

const permissions: IItemPermissions = {
  select: {
    filter: { _and: [{ id: { _nin: [] } }, { data_type_id: { _gte: 'X-Hasura-User-Id' } }] },
    columns: ['data_type_id'],
    allow_aggregations: true
  },
  update: {
    set: { id: 'dew' },
    filter: { _and: [{ id: { _in: 'X-Array-Ids' } }, { data_type_id: { _nin: 'X-Array-Ids' } }] },
    columns: ['source_id']
  },
  delete: {
    filter: { _and: [{ _not: { class_id: { _in: 'X-Array-Ids' } } }] } // { data_type_id: { _gte: 'X-Hasura-User-Id' } }
  },
  insert: {
    set: { class_id: '2fwefew', source_id: 'X-Hasura-Role-Id' },
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
  id: 'X1234',
  class_id: '2fwefew',
  data_type_id: '4567799',
  encounter_type_concepts: {
    id: '12345'
  }
}
const environment: any = {
  'X-Hasura-User-Id': '1234',
  'X-Array-Ids': ['X1234', 'Y5678']
}

test('insert', () => {
  expect(validateInsert(newObject, permissions.insert, environment)).toBeTruthy()
})

test('update', () => {
  expect(validateUpdate(newObject, permissions.update, environment)).toBeTruthy()
})

test('delete', () => {
  expect(validateDelete(newObject, permissions.delete, environment)).toBeTruthy()
})

// TODO test all the hasura operations!

test('generateSqlConstraints', () => {
  // TODO not enough tests?
  const check = {
    _and: [
      { encounter_type_concepts: { id: { _ne: 'X-Hasura-User-Id' } } },
      {
        _or: [{ data_type_id: { _gte: 'X-Hasura-User-Id' } }, { another_id: { _lte: 'X-Hasura-User-Id' } }]
      }
    ]
  }
  expect(generateSqlConstraints(check, environment)).toEqual(
    "(encounter_type_concepts.id != '1234' AND (data_type_id >= '1234' OR another_id <= '1234'))"
  )
})
