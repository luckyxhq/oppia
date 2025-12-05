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
 * @fileoverview Unit tests for LessonProgressBarComponent.
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LessonProgressBarComponent} from './lesson-progress-bar.component';
import {ExplorationLessonPartsService} from '../services/exploration-lesson-parts.service';
import {ExplorationStatesService} from '../services/exploration-states.service';
import {EventEmitter} from '@angular/core';

describe('LessonProgressBarComponent', () => {
  let component: LessonProgressBarComponent;
  let fixture: ComponentFixture<LessonProgressBarComponent>;
  let explorationLessonPartsService: ExplorationLessonPartsService;
  let explorationStatesService: ExplorationStatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LessonProgressBarComponent],
      providers: [ExplorationLessonPartsService, ExplorationStatesService],
    });
    fixture = TestBed.createComponent(LessonProgressBarComponent);
    component = fixture.componentInstance;
    explorationLessonPartsService = TestBed.inject(
      ExplorationLessonPartsService
    );
    explorationStatesService = TestBed.inject(ExplorationStatesService);

    // Mock the refresh graph event emitter
    spyOnProperty(
      explorationStatesService,
      'onRefreshGraph',
      'get'
    ).and.returnValue(new EventEmitter());
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should not be visible initially if service is not initialized', () => {
    spyOn(explorationLessonPartsService, 'isInitialized').and.returnValue(
      false
    );
    component.ngOnInit();
    expect(component.isVisible).toBe(false);
  });

  it('should be visible and update progress when service is initialized', () => {
    spyOn(explorationLessonPartsService, 'isInitialized').and.returnValue(true);
    spyOn(explorationLessonPartsService, 'getTotalParts').and.returnValue(10);
    spyOn(explorationLessonPartsService, 'getCreatedParts').and.returnValue(5);
    spyOn(
      explorationLessonPartsService,
      'getProgressPercentage'
    ).and.returnValue(50);

    component.ngOnInit();
    expect(component.isVisible).toBe(true);
    expect(component.totalParts).toBe(10);
    expect(component.createdParts).toBe(5);
    expect(component.progressPercentage).toBe(50);
  });

  it('should update progress when total parts changes', () => {
    const onTotalPartsChanged = new EventEmitter<number>();
    spyOnProperty(
      explorationLessonPartsService,
      'onTotalPartsChanged',
      'get'
    ).and.returnValue(onTotalPartsChanged);
    spyOn(explorationLessonPartsService, 'isInitialized').and.returnValue(true);
    spyOn(explorationLessonPartsService, 'getTotalParts').and.returnValue(10);
    spyOn(explorationLessonPartsService, 'getCreatedParts').and.returnValue(3);
    spyOn(
      explorationLessonPartsService,
      'getProgressPercentage'
    ).and.returnValue(30);

    component.ngOnInit();
    onTotalPartsChanged.emit(10);

    expect(component.totalParts).toBe(10);
    expect(component.createdParts).toBe(3);
    expect(component.progressPercentage).toBe(30);
  });
});
