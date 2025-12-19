import { Resource } from '@angular/core';

export const resourceValueGuard = <T>(resource: Resource<T>) => (resource.hasValue() ? resource.value() : null);
