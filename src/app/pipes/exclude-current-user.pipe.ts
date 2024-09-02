import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'excludeCurrentUser'
})
export class ExcludeCurrentUserPipe implements PipeTransform {
  transform(users: any[], currentUserId: string): any[] {
    if (!users || !currentUserId) {
      return users;
    }
    return users.filter(user => user.userid !== currentUserId);
  }
}

