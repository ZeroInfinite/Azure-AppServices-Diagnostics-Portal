import { Injectable } from '@angular/core';
import { ArmService } from './arm.service';
import { IAppAnalysisResponse } from '../models/appanalysisresponse';
import { IDetectorResponse } from '../models/detectorresponse';
import { IDiagnosticProperties } from '../models/diagnosticproperties';
import { ResponseMessageEnvelope, ResponseMessageCollectionEnvelope } from '../models/responsemessageenvelope';
import { IDetectorDefinition } from '../models/detectordefinition';
import { Observable } from 'rxjs'
import { UriElementsService } from './urielements.service';
import { AvailabilityLoggingService } from './logging/availability.logging.service';
import { DetectorControlService } from '../../../../node_modules/applens-diagnostics';

@Injectable()
export class AppAnalysisService {

    constructor(private _armService: ArmService, private _uriElementsService: UriElementsService, private _logger: AvailabilityLoggingService, private _detectorControlService: DetectorControlService) { }

    getAnalysisResource(subscriptionId: string, resourceGroup: string, siteName: string, slot: string, diagnosticCategory:string, analysisName: string, invalidateCache: boolean = false, startTime: string = null, endTime: string = null): Observable<IAppAnalysisResponse> {
        startTime = startTime ? startTime : this._detectorControlService.startTimeString;
        endTime = endTime ? endTime : this._detectorControlService.endTimeString;
        let resourceUrl: string = this._uriElementsService.getAnalysisResourceUrl(subscriptionId, resourceGroup, siteName, diagnosticCategory, analysisName, slot, startTime, endTime);
        return this._armService.postResource<ResponseMessageEnvelope<IAppAnalysisResponse>, any>(resourceUrl, null, null, invalidateCache)
            .map((response: ResponseMessageEnvelope<IAppAnalysisResponse>) => <IAppAnalysisResponse>response.properties)
            .catch(this.handleError);
    }

    getDetectors(subscriptionId: string, resourceGroup: string, siteName: string, diagnosticCategory:string, slot: string): Observable<IDetectorDefinition[]> {
        let resourceUrl: string = this._uriElementsService.getDetectorsUrl(subscriptionId, resourceGroup, siteName, diagnosticCategory, slot);
        return this._armService.getResource<any>(resourceUrl)
            .map((response: ResponseMessageCollectionEnvelope<ResponseMessageEnvelope<IDetectorDefinition>>) =>
                response.value.map((item: ResponseMessageEnvelope<IDetectorDefinition>) => <IDetectorDefinition>item.properties))
            .catch(this.handleError);
    }

    getDetectorResource(subscriptionId: string, resourceGroup: string, siteName: string, slot: string, diagnosticCategory:string, detectorName: string, invalidateCache: boolean = false, startTime: string = null, endTime: string = null): Observable<IDetectorResponse> {
        startTime = startTime ? startTime : this._detectorControlService.startTimeString;
        endTime = endTime ? endTime : this._detectorControlService.endTimeString;
        let resourceUrl: string = this._uriElementsService.getDetectorResourceUrl(subscriptionId, resourceGroup, siteName, slot, diagnosticCategory, detectorName, startTime, endTime);

        return this._armService.postResource<ResponseMessageEnvelope<IDetectorResponse>, any>(resourceUrl, null, null, invalidateCache)
            .map((response: ResponseMessageEnvelope<IDetectorResponse>) => <IDetectorResponse>response.properties)
            .do((data: IDetectorResponse) => {

                if (detectorName.toLowerCase() === 'runtimeavailability') {

                    let isAppCurrentlyHealthy: boolean = true;

                    let currentAppHealth = data.data[0].find(p => p.name.toLowerCase() === "currentapphealth");
                    if (currentAppHealth) {
                        if (currentAppHealth.value.toLowerCase() === 'unhealthy') {
                            isAppCurrentlyHealthy = false;
                        }

                        this._logger.LogCurrentHealth(isAppCurrentlyHealthy);
                    }
                }
            })
            .catch(this.handleError);
    }

    getDiagnosticProperties(subscriptionId: string, resourceGroup: string, siteName: string, slot: string, invalidateCache: boolean = false): Observable<IDiagnosticProperties> {
        let resourceUrl: string = this._uriElementsService.getDiagnosticPropertiesUrl(subscriptionId, resourceGroup, siteName, slot);

        return this._armService.getResource<ResponseMessageEnvelope<IDiagnosticProperties>>(resourceUrl, null, invalidateCache)
            .map((response: ResponseMessageEnvelope<IDiagnosticProperties>) => <IDiagnosticProperties>response.properties)
            .catch(this.handleError);
    }

    makeWarmUpCallsForSite(subscriptionId: string, resourceGroup: string, siteName: string, slot: string) {
        this.getAnalysisResource(subscriptionId, resourceGroup, siteName, slot, 'availability', 'appanalysis').subscribe();
        this.getAnalysisResource(subscriptionId, resourceGroup, siteName, slot, 'availability', 'perfanalysis').subscribe();
    }

    private handleError(error: any) {
        return Observable.throw(error);
    }
}