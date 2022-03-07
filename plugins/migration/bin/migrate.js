#!/usr/bin/env node
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A script for helping to migrate between versions of Blockly.
 */
import {tempTopLevel} from './rename.js';

tempTopLevel('0.0.0', '100.0.0', './*');