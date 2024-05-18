// TODO add user id

export interface ObservationI {
    category: string;
    date: Date;
    note_id: string;
    id: string;
    details: string;
}

export interface NoteI {
    content: string;
    date: Date;
    id: string;
    bucketing: boolean;
    bucketing_error: boolean;
    observations: ObservationI[];
}
