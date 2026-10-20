export interface StatusResponse {
  status: string;
  services: {
    instanceId: string;
    instanceStartTime: Date;
    instanceUptime: string;
    dataBase: boolean;
    apiV2: boolean;
  };
  time: string;
}
