import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

import { Place } from './place.model';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);
  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something went wrong fetching the available places. Please try again later.'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something went wrong fetching your favorite places. Please try again later.'
    ).pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if (!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...prevPlaces, place]);

      return this.httpClient
        .put('http://localhost:3000/user-places', {
          placeId: place.id,
        })
        .pipe(
          catchError((error) => {
            this.userPlaces.set(prevPlaces);
            this.errorService.showError(
              'Something went wrong adding the place to your favorite places. Please try again later.'
            );
            return throwError(() => new Error());
          })
        );
    } else {
      return throwError(
        () => new Error('Place already exists in your favorite places.')
      );
    }
  }

  removeUserPlace(place: Place) {
    const currentPlaces = this.userPlaces();

    if (currentPlaces.some((p) => p.id !== place.id)) {
      const newPlaces = currentPlaces.filter((p) => p.id !== place.id);
      this.userPlaces.set([...newPlaces]);
    }

    return this.httpClient
      .delete(`http://localhost:3000/user-places/${place.id}`)
      .pipe(
        catchError((error) => {
          this.userPlaces.set(currentPlaces);
          this.errorService.showError(
            'Something went wrong removing the place. Please try again later.'
          );
          return throwError(() => new Error());
        })
      );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      map((resData) => resData.places),
      catchError((error) => {
        console.log(error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
