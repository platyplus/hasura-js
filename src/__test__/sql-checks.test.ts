import { validateConstraint } from '../sql-constraints'

test(`Test =`, () => {
  const check = 'bidon = 3'
  expect(validateConstraint(check, { bidon: 3 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 4 })).toBeFalsy()
  expect(validateConstraint(check, {})).toBeFalsy()
  expect(validateConstraint(check, { bidon: 'text A' })).toBeFalsy()
  const strCheck = "bidon = 'text B'"
  expect(validateConstraint(strCheck, { bidon: 'text B' })).toBeTruthy()
  expect(validateConstraint(strCheck, { bidon: 1 })).toBeFalsy()
})

test(`Test >`, () => {
  const check = 'bidon > 3'
  expect(validateConstraint(check, { bidon: 4 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 3 })).toBeFalsy()
  expect(validateConstraint(check, { bidon: 2 })).toBeFalsy()
  expect(validateConstraint(check, {})).toBeFalsy()
  expect(validateConstraint(check, { bidon: 'text C' })).toBeFalsy()
  // TODO compare strings and decimals
})

test(`Test >=`, () => {
  const check = 'bidon >= 3'
  expect(validateConstraint(check, { bidon: 4 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 3 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 2 })).toBeFalsy()
  expect(validateConstraint(check, {})).toBeFalsy()
  expect(validateConstraint(check, { bidon: 'text D' })).toBeFalsy()
  // TODO compare strings and decimals
})

test(`Test <`, () => {
  const check = 'bidon < 3'
  expect(validateConstraint(check, { bidon: 2 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 3 })).toBeFalsy()
  expect(validateConstraint(check, { bidon: 4 })).toBeFalsy()
  expect(validateConstraint(check, {})).toBeFalsy()
  expect(validateConstraint(check, { bidon: 'text E' })).toBeFalsy()
  // TODO compare strings and decimals
})

test(`Test <=`, () => {
  const check = 'bidon <= 3'
  expect(validateConstraint(check, { bidon: 2 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 3 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 4 })).toBeFalsy()
  expect(validateConstraint(check, {})).toBeFalsy()
  expect(validateConstraint(check, { bidon: 'text F' })).toBeFalsy()
  // TODO compare strings and decimals
})

test(`Test length`, () => {
  const check = 'length(bidon) = 3'
  expect(validateConstraint(check, { bidon: 'abc' })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 'text G' })).toBeFalsy()
  expect(validateConstraint(check, { bidon: '' })).toBeFalsy()
  expect(validateConstraint(check, {})).toBeFalsy()
  expect(validateConstraint(check, { bidon: null })).toBeFalsy()
  // TODO thing about other cases
})

test(`Test AND`, () => {
  // TODO break down into separate tests
  const check = 'length(bidon) > 0 AND autre = 12 AND enfin < 4'
  // all conditions ok
  expect(
    validateConstraint(check, {
      autre: 12,
      enfin: 3,
      bidon: 'dede'
    })
  ).toBeTruthy()
  // invalid <
  expect(
    validateConstraint(check, {
      autre: 12,
      enfin: 10,
      bidon: 'dede'
    })
  ).toBeFalsy()
  // invalid =
  expect(
    validateConstraint(check, {
      autre: 11,
      enfin: 3,
      bidon: 'dede'
    })
  ).toBeFalsy()
  // Invalid length
  expect(
    validateConstraint(check, {
      autre: 12,
      enfin: 3,
      bidon: ''
    })
  ).toBeFalsy()
})

test(`Test OR`, () => {
  const check = 'bidon = 1 or bidon = 2'
  expect(validateConstraint(check, { bidon: 1 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 2 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 3 })).toBeFalsy()
  expect(validateConstraint(check, { bidon: 'text H' })).toBeFalsy()
  expect(validateConstraint(check, { bidon: '' })).toBeFalsy()
  expect(validateConstraint(check, {})).toBeFalsy()
  expect(validateConstraint(check, { bidon: null })).toBeFalsy()
  const capsCheck = 'bidon = 1 OR bidon = 2'
  expect(validateConstraint(capsCheck, { bidon: 1 })).toBeTruthy()
  expect(validateConstraint(capsCheck, { bidon: 3 })).toBeFalsy()
})

test(`Test NOT`, () => {
  const check = 'NOT(bidon = 1)'
  expect(validateConstraint(check, { bidon: 2 })).toBeTruthy()
  expect(validateConstraint(check, { bidon: 1 })).toBeFalsy()
  expect(validateConstraint(check, { bidon: 'text I' })).toBeTruthy()
  expect(validateConstraint(check, { bidon: '' })).toBeTruthy()
  expect(validateConstraint(check, {})).toBeTruthy()
  expect(validateConstraint(check, { bidon: null })).toBeTruthy()
  const capsCheck = 'NOT(bidon = 1)'
  expect(validateConstraint(capsCheck, { bidon: 2 })).toBeTruthy()
  expect(validateConstraint(capsCheck, { bidon: 1 })).toBeFalsy()
})

test(`Test LIKE`, () => {
  expect(validateConstraint("bidon LIKE '%lou'", { bidon: 'Pilou' })).toBeTruthy()
  expect(validateConstraint("bidon LIKE '%LOU'", { bidon: 'Pilou' })).toBeFalsy()
  expect(validateConstraint("bidon LIKE '%lou'", { bidon: 'Pile' })).toBeFalsy()
  expect(validateConstraint("bidon LIKE 'Pi%'", { bidon: 'Pilou' })).toBeTruthy()
  expect(validateConstraint("bidon LIKE 'c'", { bidon: 'abc' })).toBeFalsy()
})

test(`Test IS NULL, IS NOT NULL`, () => {
  expect(validateConstraint('bidon IS NULL', { bidon: null })).toBeTruthy()
  expect(validateConstraint('bidon IS NOT NULL', { bidon: null })).toBeFalsy()
  expect(validateConstraint('bidon IS NULL', { bidon: 'exists' })).toBeFalsy()
  expect(validateConstraint('bidon IS NOT NULL', { bidon: 'exists' })).toBeTruthy()
})

// TODO ILIKE, SIMILAR, ISIMILAR
