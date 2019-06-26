import { isLike, isSimilar } from '../index'

test(`Postgres' LIKE and ILIKE in javascript`, () => {
  expect(isLike('Pilou', '%lou')).toBeTruthy()
  expect(isLike('Pilou', '%LOU')).toBeFalsy()
  expect(isLike('Pile', '%lou')).toBeFalsy()
  expect(isLike('Pilou', 'Pi%')).toBeTruthy()
  expect(isLike('abc', 'c')).toBeFalsy()
})

test(`Postgres' ILIKE in javascript`, () => {
  expect(isLike('Pilou', '%lou')).toBeTruthy()
  expect(isLike('Pilou', '%LOU', false)).toBeTruthy()
})

// TODO uncomment once isSimilar is implemented
/*
test(`Postgres' SIMIlAR TO in javascript`, () => {
  expect(isSimilar('abc', 'abc')).toBeTruthy()
  expect(isSimilar('abc', 'a')).toBeFalsy()
  // expect(isSimilar('abc', '%(b|d)%')).toBeTruthy() 
  expect(isSimilar('abc', '(b|c)%')).toBeFalsy()
})
*/
