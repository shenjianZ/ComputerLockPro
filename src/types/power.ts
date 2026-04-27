export interface PowerStatus {
  preventSleepEnabled: boolean;
}

export interface AutostartStatus {
  autoStartEnabled: boolean;
}

export interface PowerScheduleResult {
  action: string;
  delaySeconds: number;
  message: string;
}
