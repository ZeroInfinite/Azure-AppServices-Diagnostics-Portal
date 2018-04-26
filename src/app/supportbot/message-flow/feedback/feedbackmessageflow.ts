import { Injectable } from '@angular/core';
import { IMessageFlowProvider } from '../../interfaces/imessageflowprovider';
import { Message, TextMessage, ButtonListMessage } from '../../models/message';
import { MessageGroup } from '../../models/message-group';
import { RegisterMessageFlowWithFactory } from '../message-flow.factory';
import { FeedbackComponent } from './feedback.component';
import { MessageSender, ButtonActionType } from '../../models/message-enums';
import { AuthService } from '../../../shared/services/auth.service';
import { ResourceType } from '../../../shared/models/portal';

@Injectable()
@RegisterMessageFlowWithFactory()
export class FeedbackMessageFlow implements IMessageFlowProvider {

    constructor(private _authService: AuthService) {
    }

    GetMessageFlowList(): MessageGroup[] {
        let resourceName = this._authService.resourceType === ResourceType.Site ? 'App Service' : 'App Service Environment';

        var messageGroupList: MessageGroup[] = [];

        var feedbackPromptGroup: MessageGroup = new MessageGroup('feedbackprompt', [], () => 'feedback');

        feedbackPromptGroup.messages.push(new TextMessage(`Thanks for using ${resourceName} diagnostics. Did you find this experience useful?`, MessageSender.System, 2500));
        feedbackPromptGroup.messages.push(new ButtonListMessage(this._getButtonListForHealthCheckFeedback(), 'Was diagnoser useful?'));
        feedbackPromptGroup.messages.push(new TextMessage('Yes, thank you!', MessageSender.User, 100));
        feedbackPromptGroup.messages.push(new TextMessage('Great, I\'m glad I could be of help!', MessageSender.System));

        messageGroupList.push(feedbackPromptGroup);

        var feedbackGroup: MessageGroup = new MessageGroup('feedback', [], () => '');
        feedbackGroup.messages.push(new TextMessage('Please help me improve by providing some feedback. What was my most/least helpful feature? What features would you like to see?'));
        feedbackGroup.messages.push(new FeedbackMessage());
        feedbackGroup.messages.push(new TextMessage('Thank you!'));
        // TODO : Add Button Message - 1) To Refresh, 2) Return to top
        messageGroupList.push(feedbackGroup);

        return messageGroupList;
    }

    private _getButtonListForHealthCheckFeedback(): any {
        return [{
            title: 'Yes, thank you!',
            type: ButtonActionType.Continue,
            next_key: ''
        }, {
            title: 'I need further assistance.',
            type: ButtonActionType.SwitchToOtherMessageGroup,
            next_key: 'further-assistance'
        }];
    }
}

export class FeedbackMessage extends Message {
    constructor(messageDelayInMs: number = 1000) {

        super(FeedbackComponent, {}, messageDelayInMs);
    }
}
