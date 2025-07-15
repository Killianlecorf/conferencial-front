import type { User } from "./user.type";

export type Conference = {
  id: number;
  title: string;
  description: string;
  speakerName: string;
  speakerBio?: string;
  startDateTime: string;
  endDateTime: string;
  slotNumber: number;
  conferentialUser: User[];
};
