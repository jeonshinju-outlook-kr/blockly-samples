/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Realtime collaboration sample code using Node.js HTTP server
 * and SQlite.
 * @author navil@google.com (Navil Perez)
 */

import * as Blockly from "blockly";
import {getSnapshot, getEvents, writeEvents} from "./workspace_client_handlers";
import {getPositionUpdates, sendPositionUpdate} from "./user_data_handlers";
import UserDataManager from "../UserDataManager";
import WorkspaceClient from "../WorkspaceClient";

document.addEventListener("DOMContentLoaded", async () => {
  const workspace = Blockly.inject("blocklyDiv", {
    toolbox: document.getElementById("toolbox"),
    media: "media/",
  });
  const workspaceClient = new WorkspaceClient(
    workspace.id,
    getSnapshot,
    getEvents,
    writeEvents
  );
  workspaceClient.listener.on("runEvents", (eventQueue) => {
    runEvents_(eventQueue);
  });
  await workspaceClient.start();

  const userDataManager = new UserDataManager(
    workspace.id,
    sendPositionUpdate,
    getPositionUpdates
  );
  await userDataManager.start();

  workspace.addChangeListener((event) => {
    if (
      event.type === Blockly.Events.SELECTED ||
      (event.type === Blockly.Events.CHANGE && event.element === "field")
    ) {
      userDataManager.handleEvent(event);
    }
    if (event.isUiEvent) {
      return;
    }
    workspaceClient.activeChanges.push(event);
    if (!Blockly.Events.getGroup()) {
      workspaceClient.flushEvents();
    }
  });

  /**
   * Run a series of events that allow the order of events on the workspace
   * to converge with the order of events on the database.
   * @param {!Array.<!WorkspaceAction>} eventQueue An array of events and the
   * direction they should be run.
   * @private
   */
  function runEvents_(eventQueue) {
    eventQueue.forEach((workspaceAction) => {
      Blockly.Events.disable();
      workspaceAction.event.run(workspaceAction.forward);
      Blockly.Events.enable();
    });
  }
});
