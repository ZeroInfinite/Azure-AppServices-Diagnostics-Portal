import { Component, Injector, Output, EventEmitter, OnInit, AfterViewInit, Input, PipeTransform, Pipe } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IChatMessageComponent } from '../../interfaces/ichatmessagecomponent';
import { OperatingSystem, SiteExtensions, Site } from '../../../shared/models/site';
import { LoggingService } from '../../../shared/services/logging/logging.service';
import { SiteService } from '../../../shared/services/site.service';
import { CategoriesService } from '../../../shared/services/categories.service';
import { Category, Subcategory } from '../../../shared/models/problem-category';
import { AppAnalysisService } from '../../../shared/services/appanalysis.service';
import { AuthService } from '../../../shared/services/auth.service';
import { StartupInfo, ResourceType, AppType } from '../../../shared/models/portal';
import { IDiagnosticProperties } from '../../../shared/models/diagnosticproperties';
import { Sku } from '../../../shared/models/server-farm';

@Component({
    templateUrl: 'main-menu.component.html',
    providers: [CategoriesService],
    styleUrls: [
        'main-menu.component.css'
    ]
})
export class MainMenuComponent implements OnInit, AfterViewInit, IChatMessageComponent {

    allProblemCategories: Category[] = [];
    AppStack: string = "";
    platform: OperatingSystem = OperatingSystem.any;
    appType: AppType;
    sku: Sku;
    showToolsDropdown: boolean = false;

    @Output() onViewUpdate = new EventEmitter();
    @Output() onComplete = new EventEmitter<{ status: boolean, data?: any }>();

    constructor(private _injector: Injector, private _router: Router, private _logger: LoggingService,
        private _siteService: SiteService, private _categoryService: CategoriesService,
        private _authService: AuthService, private _appAnalysisService: AppAnalysisService) {

    }

    ngOnInit(): void {

        if (this._authService.resourceType == ResourceType.Site) {
            this._siteService.currentSite.subscribe(site => {
                if (site) {
                    this.appType = site.appType;
                    this.sku = Sku[site.sku];
                    this._authService.getStartupInfo().subscribe((startupInfo: StartupInfo) => {
                        let resourceUriParts = this._siteService.parseResourceUri(startupInfo.resourceId);
                        this._appAnalysisService.getDiagnosticProperties(resourceUriParts.subscriptionId, resourceUriParts.resourceGroup, resourceUriParts.siteName, resourceUriParts.slotName).subscribe((data: IDiagnosticProperties) => {
                            this.AppStack = data && data.appStack && data.appStack != "" ? data.appStack : "ASP.Net";
                            this.platform = data && data.isLinux ? OperatingSystem.linux : OperatingSystem.windows;
                            this._categoryService.Categories.subscribe(categories => {
                                this.allProblemCategories = categories;
                            })
                            setTimeout(() => {
                                this.onComplete.emit({ status: true });
                            }, 2000);
                        });
                    });
                }
            });
        }
        else {
            this._categoryService.Categories.subscribe(categories => {
                this.allProblemCategories = categories;
                setTimeout(() => {
                    this.onComplete.emit({ status: true });
                }, 300);
            });
        }
    }

    logCategorySelected(name: string) {
        this._logger.LogClickEvent(name, 'Home Page');
    }

    ngAfterViewInit(): void {
        this.onViewUpdate.emit();
    }

    onStackChanged(stack: string) {
        this.AppStack = stack;
        this.showToolsDropdown = false;
    }
}

@Pipe({ name: 'toolstack' })
export class ToolStackPipe implements PipeTransform {
    transform(subcategories: Subcategory[], stack: string): Subcategory[] {
        return subcategories.filter(x => (x.AppStack === "" || x.AppStack.toLowerCase().indexOf(stack.toLowerCase()) > -1));
    }
}

@Pipe({ name: 'platformfilter' })
export class PlatformPipe implements PipeTransform {
    transform(subcategories: Subcategory[], platform: OperatingSystem): Subcategory[] {
        return subcategories.filter(x => x.OperatingSystem & platform);
    }
}

@Pipe({ name: 'apptype' })
export class AppTypePipe implements PipeTransform {
    transform(subcategories: Subcategory[], appType: AppType): Subcategory[] {
        return subcategories.filter(x => x.AppType & appType);
    }
}

@Pipe({ name: 'skufilter' })
export class SkuPipe implements PipeTransform {
    transform(subcategories: Subcategory[], sku: Sku): Subcategory[] {
        return subcategories.filter(x => x.Sku & sku);
    }
}