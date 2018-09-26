import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedV2Module } from '../../shared-v2/shared-v2.module';
import { ResourceService } from '../../shared-v2/services/resource.service';
import { ResourceResolver } from '../../home/resolvers/resource.resolver';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../shared-v2/services/category.service';
import { AseCategoryService } from './services/ase-category.service';
import { ContentService } from '../../shared-v2/services/content.service';
import { FeatureService } from '../../shared-v2/services/feature.service';
import { WebHostingEnvironmentsService } from './services/web-hosting-environments.service';
import { LoggingV2Service } from '../../shared-v2/services/logging-v2.service';
import { LiveChatService } from '../../shared-v2/services/livechat.service';
import { SupportTopicService } from '../../shared-v2/services/support-topic.service';

const ResourceRoutes = RouterModule.forChild([
  {
    path: '',
    loadChildren: 'app/home/home.module#HomeModule',
    resolve: { data: ResourceResolver }
  }
]);

@NgModule({
  imports: [
    CommonModule,
    SharedV2Module,
    ResourceRoutes
  ],
  declarations: [],
  providers: [
    ContentService,
    FeatureService,
    WebHostingEnvironmentsService,
    LoggingV2Service,
    LiveChatService,
    SupportTopicService,
    { provide: ResourceService, useExisting: WebHostingEnvironmentsService },
    { provide: CategoryService, useClass: AseCategoryService },
    ResourceResolver
  ]
})
export class WebHostingEnvironmentsModule { }