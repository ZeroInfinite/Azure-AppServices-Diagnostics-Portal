import { Component, Input } from '@angular/core';
import { SolutionTypeTag } from '../../../../shared/models/solution-type-tag';


@Component({
    selector: 'default-solution-template',
    templateUrl: 'default-solution-template.component.html',
    styleUrls: ['default-solution-template.component.css',
        '../../../styles/solutions.css'
    ]
})
export class DefaultSolutionTemplateComponent {

    @Input() title: string;
    @Input() description: string;
    @Input() tags: SolutionTypeTag[];

}