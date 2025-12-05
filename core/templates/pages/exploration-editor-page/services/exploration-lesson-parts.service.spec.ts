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
 * @fileoverview Unit tests for ExplorationLessonPartsService.
 */

import {TestBed} from '@angular/core/testing';
import {ExplorationLessonPartsService} from './exploration-lesson-parts.service';
import {ExplorationStatesService} from './exploration-states.service';

describe('ExplorationLessonPartsService', () => {
  let service: ExplorationLessonPartsService;
  let explorationStatesService: ExplorationStatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExplorationLessonPartsService, ExplorationStatesService],
    });
    service = TestBed.inject(ExplorationLessonPartsService);
    explorationStatesService = TestBed.inject(ExplorationStatesService);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with total parts', () => {
    service.initialize(10);
    expect(service.getTotalParts()).toBe(10);
    expect(service.isInitialized()).toBe(true);
  });

  it('should set total parts', () => {
    service.setTotalParts(5);
    expect(service.getTotalParts()).toBe(5);
    expect(service.isInitialized()).toBe(true);
  });

  it('should not initialize with zero or negative parts', () => {
    service.initialize(0);
    expect(service.getTotalParts()).toBe(0);
    expect(service.isInitialized()).toBe(false);

    service.initialize(-5);
    expect(service.getTotalParts()).toBe(0);
  });

  it('should calculate progress percentage correctly', () => {
    service.setTotalParts(10);
    // Mock states service to return 5 states
    spyOn(explorationStatesService, 'isInitialized').and.returnValue(true);
    spyOn(explorationStatesService, 'getStateNames').and.returnValue([
      'State1',
      'State2',
      'State3',
      'State4',
      'State5',
    ]);

    expect(service.getProgressPercentage()).toBe(50);
  });

  it('should return 0% when total parts is 0', () => {
    expect(service.getProgressPercentage()).toBe(0);
  });

  it('should return 0 created parts when states service is not initialized', () => {
    spyOn(explorationStatesService, 'isInitialized').and.returnValue(false);
    expect(service.getCreatedParts()).toBe(0);
  });

  it('should reset service', () => {
    service.setTotalParts(10);
    expect(service.isInitialized()).toBe(true);

    service.reset();
    expect(service.getTotalParts()).toBe(0);
    expect(service.isInitialized()).toBe(false);
  });

  it('should emit event when total parts changes', () => {
    spyOn(service.onTotalPartsChanged, 'emit');
    service.setTotalParts(10);
    expect(service.onTotalPartsChanged.emit).toHaveBeenCalledWith(10);
  });
});
