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
 * @fileoverview Component for displaying lesson creation progress bar.
 * Shows creators how many questions/parts they have created out of their target total.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ExplorationLessonPartsService} from '../services/exploration-lesson-parts.service';
import {ExplorationStatesService} from '../services/exploration-states.service';

@Component({
  selector: 'oppia-lesson-progress-bar',
  templateUrl: './lesson-progress-bar.component.html',
  styleUrls: ['./lesson-progress-bar.component.css'],
})
export class LessonProgressBarComponent implements OnInit, OnDestroy {
  createdParts: number = 0;
  totalParts: number = 0;
  progressPercentage: number = 0;
  isVisible: boolean = false;

  private directiveSubscriptions = new Subscription();

  constructor(
    private explorationLessonPartsService: ExplorationLessonPartsService,
    private explorationStatesService: ExplorationStatesService
  ) {}

  ngOnInit(): void {
    // Check if service is initialized
    if (this.explorationLessonPartsService.isInitialized()) {
      this.updateProgress();
      this.isVisible = true;
    }

    // Subscribe to total parts changes
    this.directiveSubscriptions.add(
      this.explorationLessonPartsService.onTotalPartsChanged.subscribe(() => {
        this.updateProgress();
        this.isVisible = true;
      })
    );

    // Subscribe to state changes to update progress
    this.directiveSubscriptions.add(
      this.explorationStatesService.onRefreshGraph.subscribe(() => {
        if (this.explorationLessonPartsService.isInitialized()) {
          this.updateProgress();
        }
      })
    );
  }

  private updateProgress(): void {
    this.totalParts = this.explorationLessonPartsService.getTotalParts();
    this.createdParts = this.explorationLessonPartsService.getCreatedParts();
    this.progressPercentage =
      this.explorationLessonPartsService.getProgressPercentage();
  }

  ngOnDestroy(): void {
    this.directiveSubscriptions.unsubscribe();
  }
}
