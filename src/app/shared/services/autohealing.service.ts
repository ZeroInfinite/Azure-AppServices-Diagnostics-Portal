import { Injectable } from "@angular/core";
import { ArmService } from "./arm.service";
import { UriElementsService } from "./urielements.service";
import { Observable } from "rxjs/Observable";
import { AutoHealSettings } from "../models/autohealing";
import { SiteInfoMetaData } from "../models/site";
import { ResponseMessageEnvelope } from "../models/responsemessageenvelope";
import { SiteService } from "./site.service";

@Injectable()
export class AutohealingService {
    constructor(private _armService: ArmService, private _siteService: SiteService, private _uriElementsService: UriElementsService) {
    }

    getAutohealSettings(site: SiteInfoMetaData): Observable<AutoHealSettings> {
        let resourceUri: string = this._uriElementsService.getConfigWebUrl(site);
        return this._armService.getResource<ResponseMessageEnvelope<AutoHealSettings>>(resourceUri, null, true)
            .map((response: ResponseMessageEnvelope<AutoHealSettings>) => {
                let autohealSettings: AutoHealSettings = new AutoHealSettings();
                autohealSettings.autoHealEnabled = response.properties.autoHealEnabled;
                autohealSettings.autoHealRules = response.properties.autoHealRules;
                return autohealSettings;
            });

    }

    updateAutohealSettings(site: SiteInfoMetaData, autohealSettings: AutoHealSettings): Observable<AutoHealSettings> {
        let resourceUri: string = this._uriElementsService.getConfigWebUrl(site);
        let properties = { "properties": autohealSettings };
        return this._armService.putResource(resourceUri, properties, null, true).map((response: ResponseMessageEnvelope<AutoHealSettings>) => {
            let autohealSettings: AutoHealSettings = new AutoHealSettings();
            autohealSettings.autoHealEnabled = response.properties.autoHealEnabled;
            autohealSettings.autoHealRules = response.properties.autoHealRules;
            return autohealSettings;
        });
    }

    isProactiveAutohealEnabled(site: SiteInfoMetaData): Observable<boolean> {
        let isProactiveEnabled: boolean = true;
        return this._siteService.getSiteAppSettings(site.subscriptionId, site.resourceGroupName, site.siteName, site.slot)
            .map(settingsResponse => {
                if (settingsResponse && settingsResponse.properties) {
                    if (settingsResponse.properties["WEBSITE_PROACTIVE_AUTOHEAL_ENABLED"]) {
                        let settingValue: string = settingsResponse.properties["WEBSITE_PROACTIVE_AUTOHEAL_ENABLED"];
                        if (settingValue.toLowerCase() === "false") {
                            isProactiveEnabled = false;
                        }
                    }
                }
                return isProactiveEnabled;
            });
    }

    updateProactiveAutohealing(site: SiteInfoMetaData, enableProactiveAutohealing: boolean): Observable<any> {        
        return this._siteService.getSiteAppSettings(site.subscriptionId, site.resourceGroupName, site.siteName, site.slot)
            .map(settingsResponse => {
                if (settingsResponse && settingsResponse.properties) {
                    if (enableProactiveAutohealing) {
                        if (settingsResponse.properties["WEBSITE_PROACTIVE_AUTOHEAL_ENABLED"]) {
                            delete settingsResponse.properties["WEBSITE_PROACTIVE_AUTOHEAL_ENABLED"];
                            this._siteService.updateSiteAppSettings(site.subscriptionId, site.resourceGroupName, site.siteName, site.slot, settingsResponse).subscribe(updateResponse => {
                                return updateResponse;
                            });
                        }
                    }
                    else {
                        settingsResponse.properties["WEBSITE_PROACTIVE_AUTOHEAL_ENABLED"] = false;
                        this._siteService.updateSiteAppSettings(site.subscriptionId, site.resourceGroupName, site.siteName, site.slot, settingsResponse).subscribe(updateResponse => {
                            return updateResponse;
                        });
                    }
                }
            });
    }
}