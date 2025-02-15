export type EventName = string;

export type EventType = {
    trackId?: string;
    name: EventName;
    [key: string]: any;
}