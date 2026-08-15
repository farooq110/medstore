import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule],
  template: `<div style="padding:2rem"><h1>Users Management</h1><p>Manage store users, sales persons, and delivery agents here.</p></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersManagementComponent {}
