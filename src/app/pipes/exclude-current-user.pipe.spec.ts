import { ExcludeCurrentUserPipe } from './exclude-current-user.pipe';

describe('ExcludeCurrentUserPipe', () => {
  it('create an instance', () => {
    const pipe = new ExcludeCurrentUserPipe();
    expect(pipe).toBeTruthy();
  });
});
