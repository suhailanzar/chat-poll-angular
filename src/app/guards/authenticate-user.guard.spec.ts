import { TestBed } from '@angular/core/testing';

import { AuthenticateUserGuard } from './authenticate-user.guard';

describe('AuthenticateUserGuard', () => {
  let guard: AuthenticateUserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthenticateUserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
