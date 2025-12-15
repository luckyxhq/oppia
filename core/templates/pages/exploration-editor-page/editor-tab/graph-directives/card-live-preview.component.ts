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
 * @fileoverview Interactive component for displaying live card preview in editor.
 * Shows creators exactly how the current state card will appear to learners with
 * full interactivity including hints, feedback, and answer submission.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {StateEditorService} from 'components/state-editor/state-editor-properties-services/state-editor.service';
import {ExplorationStatesService} from '../../services/exploration-states.service';
import {State} from 'domain/state/state.model';
import {SubtitledHtml} from 'domain/exploration/subtitled-html.model';

interface EditHistoryEntry {
  user: string;
  action: string;
  timestamp: Date;
  details: string;
}

interface CardSequenceItem {
  id: number;
  title: string;
  status: string;
}

interface InteractionHint {
  hintContent: {
    html: string;
  };
}

interface MultipleChoiceOption {
  html?: string;
  contentId?: string;
}

interface ChoicesCustomizationArg {
  value: MultipleChoiceOption[];
}

@Component({
  selector: 'card-live-preview',
  templateUrl: './card-live-preview.component.html',
  styleUrls: ['./card-live-preview.component.css', './learning-path-ultra.css'],
})
export class CardLivePreviewComponent implements OnInit, OnDestroy {
  currentState: State | null = null;
  stateContent: SubtitledHtml | null = null;
  interactionId: string | null = null;
  interactionCustomizationArgs: Record<string, unknown> = {};
  hints: InteractionHint[] = [];

  // Interactive state.
  showHint: boolean = false;
  showFeedback: boolean = false;
  isCorrectAnswer: boolean = false;
  feedbackMessage: string = '';
  userAnswer: string = '';
  currentHintIndex: number = 0;

  // Version History.
  showVersionHistory: boolean = false;
  editHistory: EditHistoryEntry[] = [
    {
      user: 'You',
      action: 'Created card',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      details: 'Initial card creation',
    },
    {
      user: 'You',
      action: 'Updated content',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      details: 'Changed the question text',
    },
    {
      user: 'You',
      action: 'Added feedback',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      details: 'Updated feedback for incorrect answers',
    },
    {
      user: 'You',
      action: 'Added hint',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: 'Added helpful hint for learners',
    },
  ];

  // Learning Path.
  currentCardIndex: number = 1;
  totalCards: number = 5;
  cardSequence: CardSequenceItem[] = [
    {id: 1, title: 'Introduction', status: 'completed'},
    {id: 2, title: 'Main Concept', status: 'current'},
    {id: 3, title: 'Practice', status: 'upcoming'},
    {id: 4, title: 'Feedback', status: 'upcoming'},
    {id: 5, title: 'Summary', status: 'upcoming'},
  ];

  private subscriptions = new Subscription();

  constructor(
    private stateEditorService: StateEditorService,
    private explorationStatesService: ExplorationStatesService
  ) {}

  ngOnInit(): void {
    this.loadCurrentState();

    // Subscribe to state changes for real-time updates.
    this.subscriptions.add(
      this.explorationStatesService.onRefreshGraph.subscribe(() => {
        this.loadCurrentState();
        this.resetInteractions();
      })
    );
  }

  loadCurrentState(): void {
    const stateName = this.stateEditorService.getActiveStateName();
    if (!stateName) {
      return;
    }

    this.currentState = this.explorationStatesService.getState(stateName);
    if (this.currentState) {
      this.stateContent = this.currentState.content;
      this.interactionId = this.currentState.interaction.id;
      this.interactionCustomizationArgs = this.currentState.interaction
        .customizationArgs as Record<string, unknown>;
      this.hints =
        (this.currentState.interaction.hints as InteractionHint[]) || [];
    }
  }

  resetInteractions(): void {
    this.showHint = false;
    this.showFeedback = false;
    this.userAnswer = '';
    this.currentHintIndex = 0;
  }

  getMultipleChoiceOptions(): string[] {
    if (
      this.interactionId === 'MultipleChoiceInput' &&
      this.interactionCustomizationArgs &&
      'choices' in this.interactionCustomizationArgs &&
      this.interactionCustomizationArgs.choices &&
      typeof this.interactionCustomizationArgs.choices === 'object' &&
      'value' in this.interactionCustomizationArgs.choices
    ) {
      const choicesArg = this.interactionCustomizationArgs
        .choices as ChoicesCustomizationArg;
      return choicesArg.value.map(
        (choice: MultipleChoiceOption) =>
          choice.html || choice.contentId || 'Option'
      );
    }
    return [];
  }

  getContentHtml(): string {
    return (
      this.stateContent?.html ||
      'No content yet. Start typing in the content editor!'
    );
  }

  hasContent(): boolean {
    return this.stateContent?.html
      ? this.stateContent.html.trim().length > 0
      : false;
  }

  hasInteraction(): boolean {
    return this.interactionId !== null && this.interactionId !== '';
  }

  hasHints(): boolean {
    return this.hints && this.hints.length > 0;
  }

  getCurrentHint(): string {
    if (this.hasHints() && this.currentHintIndex < this.hints.length) {
      return (
        this.hints[this.currentHintIndex].hintContent?.html ||
        'No hint text available'
      );
    }
    return 'No hints available for this card';
  }

  toggleHint(): void {
    this.showHint = !this.showHint;
    if (this.showHint && this.showFeedback) {
      this.showFeedback = false;
    }
  }

  onAnswerChange(value: string): void {
    this.userAnswer = value;
    this.showFeedback = false;
  }

  skipCard(): void {
    this.showFeedback = true;
    this.isCorrectAnswer = true;
    this.feedbackMessage = 'Skipping to next card (simulated).';
  }

  submitAnswer(): void {
    if (!this.userAnswer && this.interactionId !== 'Continue') {
      this.showFeedback = true;
      this.isCorrectAnswer = false;
      this.feedbackMessage = 'Please provide an answer before submitting.';
      return;
    }

    // Simulate answer checking (in real implementation, this would use answer classification)
    this.showFeedback = true;

    // For demo purposes, show feedback based on interaction type.
    if (this.interactionId === 'Continue') {
      this.isCorrectAnswer = true;
      this.feedbackMessage = "Great! Let's continue to the next card.";
    } else {
      // Simple demo logic - in production this would check against actual answer groups.
      this.isCorrectAnswer = this.userAnswer.length > 0;
      this.feedbackMessage = this.isCorrectAnswer
        ? 'Good answer! This feedback simulates what a learner would see.'
        : 'Try again! This feedback simulates an incorrect answer response.';
    }
  }

  getPlaceholder(): string {
    if (this.interactionId === 'TextInput') {
      return 'Type your answer here...';
    } else if (this.interactionId === 'NumericInput') {
      return 'Enter a number...';
    }
    return '';
  }

  // Version History Methods.
  toggleVersionHistory(): void {
    this.showVersionHistory = !this.showVersionHistory;
  }

  formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffDays > 1) {
      return `${diffDays} days ago`;
    }
    if (diffDays === 1) {
      return '1 day ago';
    }
    if (diffHr > 1) {
      return `${diffHr} hours ago`;
    }
    if (diffHr === 1) {
      return '1 hour ago';
    }
    if (diffMin > 1) {
      return `${diffMin} minutes ago`;
    }
    return 'Just now';
  }

  getEditIcon(action: string): string {
    if (action.includes('Created')) {
      return '📅';
    }
    if (action.includes('Updated') || action.includes('Changed')) {
      return '✏️';
    }
    if (action.includes('Added')) {
      return '➕';
    }
    if (action.includes('Deleted')) {
      return '🗑️';
    }
    return '📝';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
