import { Room } from './room.model';

export interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  rooms: Room[];
}
