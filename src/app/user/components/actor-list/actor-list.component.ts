import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContributorDto } from '../../../core/models/contributor/contributor-search-result.model';

@Component({
  selector: 'app-actor-list',
  templateUrl: './actor-list.component.html',
  styleUrls: ['./actor-list.component.scss'],
  standalone: false,
})
export class ActorListComponent {
  @Input() actors: ContributorDto[] = [];
  @Output() viewDetails = new EventEmitter<ContributorDto>();
}
