import { isLike } from '../index'

test('LIKE and ILIKE in javascript', () => {
  expect(isLike('Pilou', '%lou')).toBeTruthy()
  expect(isLike('Pilou', '%LOU', false)).toBeTruthy()
  expect(isLike('Pilou', '%LOU')).toBeFalsy()
  expect(isLike('Pile', '%lou')).toBeFalsy()
  expect(isLike('Pilou', 'Pi%')).toBeTruthy()
  expect(isLike('abc', 'c')).toBeFalsy()
})
