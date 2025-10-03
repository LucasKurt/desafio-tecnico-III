import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-network-error-message',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './network-error-message.component.html',
  styleUrl: './network-error-message.component.scss'
})
export class NetworkErrorMessageComponent {
  @Output() retry = new EventEmitter<void>();
}
