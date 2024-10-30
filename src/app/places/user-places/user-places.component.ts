import { Component, DestroyRef, inject, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent {
  private placesService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  places = this.placesService.loadedUserPlaces;
  isFetching = signal(false);
  error = signal('');

  ngOnInit() {
    this.isFetching.set(true);
    const request = this.placesService.loadUserPlaces().subscribe({
      error: (error: Error) => {
        this.error.set(error.message);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });
    this.destroyRef.onDestroy(() => {
      request.unsubscribe();
    });
  }

  onRemovePlace(selectedPlace: Place) {
    const subscription = this.placesService
      .removeUserPlace(selectedPlace)
      .subscribe({});

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
