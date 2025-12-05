// Copyright 2024 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Service for tracking the number of lesson parts (questions)
 * for an exploration and for computing creation progress relative to that
 * target.
 */

import {EventEmitter, Injectable} from '@angular/core';
import {ExplorationStatesService} from './exploration-states.service';

@Injectable({providedIn: 'root'})
export class ExplorationLessonPartsService {
  private totalParts: number = 0;
  private initialized: boolean = false;

  // Emits the new total when it changes.
  onTotalPartsChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(private explorationStatesService: ExplorationStatesService) {}

  initialize(totalParts: number): void {
    if (totalParts > 0) {
      this.totalParts = totalParts;
      this.initialized = true;
      this.onTotalPartsChanged.emit(this.totalParts);
    }
  }

  setTotalParts(totalParts: number): void {
    if (totalParts > 0) {
      this.totalParts = totalParts;
      this.initialized = true;
      this.onTotalPartsChanged.emit(this.totalParts);
    }
  }

  getTotalParts(): number {
    return this.totalParts;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getCreatedParts(): number {
    if (!this.explorationStatesService.isInitialized()) {
      return 0;
    }
    const states = this.explorationStatesService.getStateNames();
    return Array.isArray(states) ? states.length : 0;
  }

  getProgressPercentage(): number {
    if (!this.totalParts || this.totalParts <= 0) {
      return 0;
    }
    const created = this.getCreatedParts();
    return Math.round((created / this.totalParts) * 100);
  }

  reset(): void {
    this.totalParts = 0;
    this.initialized = false;
    this.onTotalPartsChanged.emit(this.totalParts);
  }
}
