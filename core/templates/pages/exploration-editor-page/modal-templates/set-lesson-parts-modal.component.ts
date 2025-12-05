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
 * @fileoverview Component for setting the total number of lesson parts.
 * This modal appears when a creator starts a new lesson to ask how many
 * parts/questions they want to divide the chapter into.
 */

import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfirmOrCancelModal} from 'components/common-layout-directives/common-elements/confirm-or-cancel-modal.component';
import {ExplorationLessonPartsService} from '../services/exploration-lesson-parts.service';
import {AlertsService} from 'services/alerts.service';

@Component({
  selector: 'oppia-set-lesson-parts-modal',
  templateUrl: './set-lesson-parts-modal.component.html',
})
export class SetLessonPartsModalComponent
  extends ConfirmOrCancelModal
  implements OnInit
{
  totalParts: number = 10;
  minParts: number = 1;
  maxParts: number = 100;
  isInvalid: boolean = false;
  errorMessage: string = '';

  @ViewChild('totalPartsInput') totalPartsInput!: ElementRef;

  constructor(
    private ngbActiveModal: NgbActiveModal,
    private explorationLessonPartsService: ExplorationLessonPartsService,
    private alertsService: AlertsService
  ) {
    super(ngbActiveModal);
  }

  ngOnInit(): void {
    // Focus on input field when modal opens
    setTimeout(() => {
      this.totalPartsInput?.nativeElement.focus();
    }, 100);
  }

  validateInput(): void {
    if (
      !this.totalParts ||
      this.totalParts < this.minParts ||
      this.totalParts > this.maxParts
    ) {
      this.isInvalid = true;
      this.errorMessage = `Please enter a number between ${this.minParts} and ${this.maxParts}.`;
    } else {
      this.isInvalid = false;
      this.errorMessage = '';
    }
  }

  confirm(): void {
    this.validateInput();
    if (!this.isInvalid && this.totalParts) {
      this.explorationLessonPartsService.setTotalParts(this.totalParts);
      this.alertsService.addSuccessMessage(
        `Progress tracking set for ${this.totalParts} parts.`,
        3000
      );
      this.ngbActiveModal.close(this.totalParts);
    }
  }

  cancel(): void {
    // If user cancels, we can either set a default or leave it unset
    // For now, we'll just close without setting
    this.ngbActiveModal.dismiss();
  }
}
