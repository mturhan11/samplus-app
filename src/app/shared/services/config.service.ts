import { HttpClient } from "@angular/common/http";
import { Injectable, NgModule } from "@angular/core";

  //AppConfig.d.ts
export interface AppConfig {
    _baseUrl: string;
}

//AppConfigService.ts
@Injectable()
export class AppConfigService {
    private config?: AppConfig;
    loaded = false;
    constructor(private http: HttpClient) {}
    loadConfig(): Promise<void> {
        return this.http
            .get<AppConfig>('/assets/app.config.json')
            .toPromise()
            .then(data => {
                this.config = data;
                this.loaded = true;
            });
    }
    
    getConfig(): AppConfig {
        return this.config!;
    }
}