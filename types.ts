
export interface ScriptRecord {
  id: string;
  hotelName: string;
  rawContent: string;
  formattedContent: string;
  timestamp: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
