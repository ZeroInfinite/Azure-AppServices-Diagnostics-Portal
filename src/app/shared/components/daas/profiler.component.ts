import { Component, OnInit, OnDestroy } from '@angular/core';
import { Session } from '../../models/daas';
import { StepWizardSingleStep } from '../../models/step-wizard-single-step';
import { DaasService } from '../../services/daas.service';
import { WindowService } from '../../../startup/services/window.service';
import { AvailabilityLoggingService } from '../../services/logging/availability.logging.service';
import { ServerFarmDataService } from '../../services/server-farm-data.service';
import { DaasComponent } from './daas.component';
import { SiteService } from '../../services/site.service';


@Component({
    selector: 'profiler',
    templateUrl: 'profiler.component.html',
    styleUrls: ['profiler.component.css']
})

export class ProfilerComponent extends DaasComponent implements OnInit, OnDestroy {


    instancesStatus: Map<string, number>;
    selectedInstance: string;
    WizardSteps: StepWizardSingleStep[] = [];
    error: any;
    collectStackTraces: boolean = false;

    constructor(private _serverFarmServiceLocal: ServerFarmDataService, private _siteServiceLocal: SiteService, private _daasServiceLocal: DaasService, private _windowServiceLocal: WindowService, private _loggerLocal: AvailabilityLoggingService) {

        super(_serverFarmServiceLocal, _siteServiceLocal, _daasServiceLocal, _windowServiceLocal, _loggerLocal)
        this.diagnoserName = "CLR Profiler";
        this.diagnoserNameLookup = "CLR Profiler";
    }

    ngOnInit(): void {

    }

    collectProfilerTrace() {
        if (this.collectStackTraces) {
            this.diagnoserName = "CLR Profiler with Thread Stacks";
        }
        else {
            this.diagnoserName = "CLR Profiler";
        }

        this.collectDiagnoserData();
    }

    initWizard(): void {

        this.WizardSteps.push({
            Caption: "Step 1: Starting Profiler",
            IconType: "fa-play",
            AdditionalText: ""
        });

        this.WizardSteps.push({
            Caption: "Step 2: Reproduce the issue now",
            IconType: "fa-clock-o",
            AdditionalText: "Profiler trace will stop automatically after 60 seconds unless overriden explicitly"
        });

        this.WizardSteps.push({
            Caption: "Step 3: Stopping profiler",
            IconType: "fa-stop",
            AdditionalText: ""
        });

        this.WizardSteps.push({
            Caption: "Step 4: Analyzing profiler trace",
            IconType: "fa-cog",
            AdditionalText: ""
        });

    }

    getDiagnoserStateFromSession(session: Session) {
        var clrDiagnoser = session.DiagnoserSessions.find(x => x.Name.startsWith("CLR Profiler"));
        if (clrDiagnoser) {
            this.diagnoserSession = clrDiagnoser;
            if (clrDiagnoser.CollectorStatus === 2) {
                if (clrDiagnoser.CollectorStatusMessages.length > 0) {
                    clrDiagnoser.CollectorStatusMessages.forEach(msg => {
                        // The order of this IF check should not be changed
                        if (msg.Message.indexOf('Stopping') >= 0 || msg.Message.indexOf('Stopped') >= 0) {

                            this.instancesStatus.set(msg.EntityType, 3);
                        }
                        else if (msg.Message.indexOf('seconds') >= 0) {
                            this.instancesStatus.set(msg.EntityType, 2);
                        }
                    });
                    this.sessionStatus = this.instancesStatus.get(this.selectedInstance);
                }
            }
            else if (clrDiagnoser.AnalyzerStatus === 2) {

                // once we are at the analyzer, lets just set all instances's status to 
                // analyzing as we will reach here once all the collectors have finsihed
                this.sessionStatus = 4;

                this.WizardStepStatus = "";
                if (clrDiagnoser.AnalyzerStatusMessages.length > 0) {
                    var thisInstanceMessages = clrDiagnoser.AnalyzerStatusMessages.filter(x => x.EntityType.startsWith(this.selectedInstance));
                    if (thisInstanceMessages != null) {
                        var messagesLength = thisInstanceMessages.length;
                        if (messagesLength > 0) {
                            this.WizardStepStatus = thisInstanceMessages[messagesLength - 1].Message
                        }
                    }
                }

            }
        }
    }
}