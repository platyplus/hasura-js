import { isLike } from '../index'

test('LIKE in javascript', () => {
  expect(isLike('Pilou', '%lou')).toBeTruthy()
  expect(isLike('Pile', '%lou')).toBeFalsy()
  expect(isLike('Pilou', 'Pi%')).toBeTruthy()
  expect(isLike('abc', 'c')).toBeFalsy()
})
