import { checkConstraint } from '../sql-constraints'

// console.log(checkConstraint(check, data))

test(`Test =`, () => {
  const check = 'bidon = 3'
  expect(checkConstraint(check, { bidon: 3 })).toBeTruthy()
  expect(checkConstraint(check, { bidon: 4 })).toBeFalsy()
  expect(checkConstraint(check, {})).toBeFalsy()
  expect(checkConstraint(check, { bidon: 'text' })).toBeFalsy()
  const strCheck = 'bidon = "text"'
  expect(checkConstraint(strCheck, { bidon: 'text' })).toBeTruthy()
  expect(checkConstraint(strCheck, { bidon: 1 })).toBeFalsy()
})

test(`Test >`, () => {
  const check = 'bidon > 3'
  expect(checkConstraint(check, { bidon: 4 })).toBeTruthy()
  expect(checkConstraint(check, { bidon: 3 })).toBeFalsy()
  expect(checkConstraint(check, { bidon: 2 })).toBeFalsy()
  expect(checkConstraint(check, {})).toBeFalsy()
  expect(checkConstraint(check, { bidon: 'text' })).toBeFalsy()
  // TODO compare strings and decimals
})

test(`Test >=`, () => {
  const check = 'bidon >= 3'
  expect(checkConstraint(check, { bidon: 4 })).toBeTruthy()
  expect(checkConstraint(check, { bidon: 3 })).toBeTruthy()
  expect(checkConstraint(check, { bidon: 2 })).toBeFalsy()
  expect(checkConstraint(check, {})).toBeFalsy()
  expect(checkConstraint(check, { bidon: 'text' })).toBeFalsy()
  // TODO compare strings and decimals
})

test(`Test <`, () => {
  const check = 'bidon < 3'
  expect(checkConstraint(check, { bidon: 2 })).toBeTruthy()
  expect(checkConstraint(check, { bidon: 3 })).toBeFalsy()
  expect(checkConstraint(check, { bidon: 4 })).toBeFalsy()
  expect(checkConstraint(check, {})).toBeFalsy()
  expect(checkConstraint(check, { bidon: 'text' })).toBeFalsy()
  // TODO compare strings and decimals
})

test(`Test <=`, () => {
  const check = 'bidon <= 3'
  expect(checkConstraint(check, { bidon: 2 })).toBeTruthy()
  expect(checkConstraint(check, { bidon: 3 })).toBeTruthy()
  expect(checkConstraint(check, { bidon: 4 })).toBeFalsy()
  expect(checkConstraint(check, {})).toBeFalsy()
  expect(checkConstraint(check, { bidon: 'text' })).toBeFalsy()
  // TODO compare strings and decimals
})

test(`Test length`, () => {
  const check = 'length(bidon) = 3'
  expect(checkConstraint(check, { bidon: 'tex' })).toBeTruthy()
  expect(checkConstraint(check, { bidon: 'text' })).toBeFalsy()
  expect(checkConstraint(check, { bidon: '' })).toBeFalsy()
  expect(checkConstraint(check, {})).toBeFalsy()
  expect(checkConstraint(check, { bidon: null })).toBeFalsy()
  // TODO thing about other cases
})

test(`Test AND`, () => {
  // TODO break down into separate tests
  const check = 'length(bidon) > 0 and autre = 12 and enfin < 4'
  // all conditions ok
  expect(
    checkConstraint(check, {
      autre: 12,
      enfin: 3,
      bidon: 'dede'
    })
  ).toBeTruthy()
  // invalid <
  expect(
    checkConstraint(check, {
      autre: 12,
      enfin: 10,
      bidon: 'dede'
    })
  ).toBeFalsy()
  // invalid =
  expect(
    checkConstraint(check, {
      autre: 11,
      enfin: 3,
      bidon: 'dede'
    })
  ).toBeFalsy()
  // Invalid length
  expect(
    checkConstraint(check, {
      autre: 12,
      enfin: 3,
      bidon: ''
    })
  ).toBeFalsy()
})
