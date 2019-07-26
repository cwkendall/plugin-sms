import { getRuntimeUrl, FlexPlugin } from 'flex-plugin';
import React from 'react';
import OutboundSmsButton from './OutboundSmsButton';
import OutboundSmsView from './OutboundSmsView';

import SendSmsModal from './SendSmsModal';
import { IconButton } from "@twilio/flex-ui";

const PLUGIN_NAME = 'OutboundSmsPlugin';

export default class OutboundSmsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  init(flex, manager) {
    const runtime_domain = getRuntimeUrl().replace(/^https?:\/\//, "") + "/api"; //manager.serviceConfiguration.runtime_domain;

    // adds the sms button to the navbar
    // flex.SideNav.Content.add(<OutboundSmsButton key="nav-outbound-sms-button"/>);
    
    // get the JWE for authenticating the worker in our Function
    const jweToken = manager.store.getState().flex.session.ssoTokenPayload.token

    // adds the sms view
    flex.ViewCollection.Content.add(
      <flex.View name="sms" key="outbound-sms-view-parent">
        <OutboundSmsView key="outbound-sms-view" jweToken={jweToken} />
      </flex.View>
    );
    
    flex.RootContainer.Content.add(<SendSmsModal key="SendSmsModal" url={runtime_domain} jweToken={jweToken} />, {
      sortOrder: 1
    });

    const SendSmsButton = props => {
      let attrs = { To: props.task.attributes.from, From: props.task.attributes.to };
      if(props.task.attributes.endpoint === "callback"){
        attrs = { To: props.task.attributes.to, From: props.task.attributes.from }
      }
      return (
        <IconButton
          icon="Message"
          title="Send SMS"
          onClick={() => {
            var event = new CustomEvent("sendSmsModalOpen", {
              detail: attrs
            });
            window.dispatchEvent(event);
          }}
        />
      );
    };
    flex.TaskCanvasHeader.Content.add(<SendSmsButton key="send-sms" />, {
      if: props => !flex.TaskHelper.isChatBasedTask(props.task)
    });

    // flex.TaskListButtons.Content.add(<SendSmsButton key="send-sms" />, {
    //   if: props => !flex.TaskHelper.isChatBasedTask(props.task)
    // });
  }
}
