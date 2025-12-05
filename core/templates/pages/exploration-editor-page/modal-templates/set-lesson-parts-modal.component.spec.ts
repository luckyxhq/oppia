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
 * @fileoverview Unit tests for SetLessonPartsModalComponent.
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SetLessonPartsModalComponent} from './set-lesson-parts-modal.component';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ExplorationLessonPartsService} from '../services/exploration-lesson-parts.service';
import {AlertsService} from 'services/alerts.service';
import {FormsModule} from '@angular/forms';

describe('SetLessonPartsModalComponent', () => {
  let component: SetLessonPartsModalComponent;
  let fixture: ComponentFixture<SetLessonPartsModalComponent>;
  let ngbActiveModal: NgbActiveModal;
  let explorationLessonPartsService: ExplorationLessonPartsService;
  let alertsService: AlertsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SetLessonPartsModalComponent],
      providers: [NgbActiveModal, ExplorationLessonPartsService, AlertsService],
    });
    fixture = TestBed.createComponent(SetLessonPartsModalComponent);
    component = fixture.componentInstance;
    ngbActiveModal = TestBed.inject(NgbActiveModal);
    explorationLessonPartsService = TestBed.inject(
      ExplorationLessonPartsService
    );
    alertsService = TestBed.inject(AlertsService);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should validate input correctly', () => {
    component.totalParts = 5;
    component.validateInput();
    expect(component.isInvalid).toBe(false);

    component.totalParts = 0;
    component.validateInput();
    expect(component.isInvalid).toBe(true);

    component.totalParts = 150;
    component.validateInput();
    expect(component.isInvalid).toBe(true);
  });

  it('should set total parts and close modal on confirm', () => {
    spyOn(explorationLessonPartsService, 'setTotalParts');
    spyOn(alertsService, 'addSuccessMessage');
    spyOn(ngbActiveModal, 'close');

    component.totalParts = 10;
    component.isInvalid = false;
    component.confirm();

    expect(explorationLessonPartsService.setTotalParts).toHaveBeenCalledWith(
      10
    );
    expect(alertsService.addSuccessMessage).toHaveBeenCalled();
    expect(ngbActiveModal.close).toHaveBeenCalledWith(10);
  });

  it('should not confirm if input is invalid', () => {
    spyOn(explorationLessonPartsService, 'setTotalParts');
    spyOn(ngbActiveModal, 'close');

    component.totalParts = 0;
    component.isInvalid = true;
    component.confirm();

    expect(explorationLessonPartsService.setTotalParts).not.toHaveBeenCalled();
    expect(ngbActiveModal.close).not.toHaveBeenCalled();
  });

  it('should dismiss modal on cancel', () => {
    spyOn(ngbActiveModal, 'dismiss');
    component.cancel();
    expect(ngbActiveModal.dismiss).toHaveBeenCalled();
  });
});
