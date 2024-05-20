// TODO add user id

export interface UserI {
  first_name: string;
  last_name: string;
  _id: string;
}

export interface ObservationI {
  category: string;
  date: Date;
  note_id: string;
  user_id: string;
  _id: string;
  details: string;
}

export interface NoteI {
  content: string;
  date: Date;
  _id: string;
  user_id: string;
  bucketing: boolean;
  bucketing_error: boolean;
  observations: ObservationI[];
}
