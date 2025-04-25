import { ConfigService } from './services/config.service';

export function initializeApp(configService: ConfigService) {
  return (): Promise<any> => {
    return configService.loadConfig();
  };
}