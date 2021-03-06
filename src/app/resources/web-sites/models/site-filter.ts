import { OperatingSystem } from "../../../shared/models/site";
import { AppType } from "../../../shared/models/portal";
import { Sku } from "../../../shared/models/server-farm";


export interface SiteFilteredItem<T> {
    platform: OperatingSystem;
    appType: AppType;
    stack: string;
    sku: Sku;
    item: T;
}