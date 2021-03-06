import React from 'react';
import ReactDOM from 'react-dom';
import {findRenderedDOMComponentWithClass} from 'react-addons-test-utils';

import {Message} from 'nylas-exports'
import {renderIntoDocument} from '../../../spec/nylas-test-utils'
import OpenTrackingIcon from '../lib/open-tracking-icon'
import {PLUGIN_ID} from '../lib/open-tracking-constants'


function makeIcon(thread, props = {}) {
  return renderIntoDocument(<OpenTrackingIcon {...props} thread={thread} />);
}

function find(component, className) {
  return ReactDOM.findDOMNode(findRenderedDOMComponentWithClass(component, className))
}

function addOpenMetadata(obj, openCount) {
  obj.applyPluginMetadata(PLUGIN_ID, {open_count: openCount});
}

describe("Open tracking icon", () => {
  beforeEach(() => {
    this.thread = {metadata: []};
  });


  it("shows no icon if the thread has no messages", () => {
    const icon = find(makeIcon(this.thread), "open-tracking-icon");
    expect(icon.children.length).toEqual(0);
  });

  it("shows no icon if the thread messages have no metadata", () => {
    this.thread.metadata.push(new Message());
    this.thread.metadata.push(new Message());
    const icon = find(makeIcon(this.thread), "open-tracking-icon");
    expect(icon.children.length).toEqual(0);
  });

  describe("With messages and metadata", () => {
    beforeEach(() => {
      this.messages = [new Message(), new Message(), new Message({draft: true})];
      this.thread.metadata.push(...this.messages);
    });

    it("shows no icon if metadata is malformed", () => {
      this.messages[0].applyPluginMetadata(PLUGIN_ID, {gar: "bage"});
      const icon = find(makeIcon(this.thread), "open-tracking-icon");
      expect(icon.children.length).toEqual(0);
    });

    it("shows an unopened icon if last non draft message has metadata and is unopened", () => {
      addOpenMetadata(this.messages[0], 1);
      addOpenMetadata(this.messages[1], 0);
      const icon = find(makeIcon(this.thread), "open-tracking-icon");
      expect(icon.children.length).toEqual(1);
      expect(icon.querySelector("img.unopened")).not.toBeNull();
      expect(icon.querySelector("img.opened")).toBeNull();
    });

    it("shows an opened icon if last non draft message with metadata is opened", () => {
      addOpenMetadata(this.messages[0], 0);
      addOpenMetadata(this.messages[1], 1);
      const icon = find(makeIcon(this.thread), "open-tracking-icon");
      expect(icon.children.length).toEqual(1);
      expect(icon.querySelector("img.unopened")).toBeNull();
      expect(icon.querySelector("img.opened")).not.toBeNull();
    });
  });
});
