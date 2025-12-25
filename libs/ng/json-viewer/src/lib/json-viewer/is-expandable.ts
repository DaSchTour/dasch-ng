import { Segment } from './segment';

export function isExpandable(segment: Segment) {
  return segment.type === 'object' || segment.type === 'array';
}
