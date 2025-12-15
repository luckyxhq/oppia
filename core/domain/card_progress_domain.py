# coding: utf-8
#
# Copyright 2024 The Oppia Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Domain objects for card-level progress tracking in explorations."""

from __future__ import annotations

import datetime

from typing import Dict, List, Optional, TypedDict


class StateProgressDict(TypedDict):
    """Dictionary representing progress for an individual exploration state/card.

    This tracks granular progress within an exploration at the state level,
    complementing the exploration-level progress tracking.
    """

    state_name: str
    visited: bool
    completed: bool
    attempts: int
    hints_used: int
    last_visited_at: Optional[str]  # ISO format datetime string
    last_answer: Optional[str]


class CardInteractionProgress:
    """Domain object for tracking interaction-specific progress within a card.

    This represents a learner's progress through a specific interaction
    (e.g., NumericExpressionInput) within an exploration state/card.
    """

    def __init__(
        self,
        exploration_id: str,
        state_name: str,
        user_id: str,
        interaction_type: str,
        submitted_answers: Optional[List[str]] = None,
        is_correct: bool = False,
        hints_used: int = 0,
        attempts: int = 0,
        visited_at: Optional[datetime.datetime] = None,
        completed_at: Optional[datetime.datetime] = None,
    ) -> None:
        """Constructs a CardInteractionProgress domain object.

        Args:
            exploration_id: str. The ID of the exploration.
            state_name: str. The name of the state/card.
            user_id: str. The ID of the user.
            interaction_type: str. The type of interaction (e.g.,
                'NumericExpressionInput', 'TextInput').
            submitted_answers: list(str)|None. List of answers submitted by
                the learner.
            is_correct: bool. Whether the learner has submitted a correct
                answer.
            hints_used: int. Number of hints the learner has used.
            attempts: int. Number of answer submission attempts.
            visited_at: datetime|None. When the learner first visited this card.
            completed_at: datetime|None. When the learner completed this card.
        """
        self.exploration_id = exploration_id
        self.state_name = state_name
        self.user_id = user_id
        self.interaction_type = interaction_type
        self.submitted_answers = submitted_answers or []
        self.is_correct = is_correct
        self.hints_used = hints_used
        self.attempts = attempts
        self.visited_at = visited_at
        self.completed_at = completed_at

    def to_dict(self) -> StateProgressDict:
        """Returns a dictionary representation of this domain object.

        Returns:
            StateProgressDict. A dictionary with progress data.
        """
        return {
            'state_name': self.state_name,
            'visited': self.visited_at is not None,
            'completed': self.is_correct,
            'attempts': self.attempts,
            'hints_used': self.hints_used,
            'last_visited_at': (
                self.visited_at.isoformat() if self.visited_at else None
            ),
            'last_answer': (
                self.submitted_answers[-1] if self.submitted_answers else None
            ),
        }

    def record_answer_submission(self, answer: str, is_correct: bool) -> None:
        """Records an answer submission attempt.

        Args:
            answer: str. The answer submitted.
            is_correct: bool. Whether the answer is correct.
        """
        self.submitted_answers.append(answer)
        self.attempts += 1
        if is_correct:
            self.is_correct = True
            if not self.completed_at:
                self.completed_at = datetime.datetime.utcnow()

    def use_hint(self) -> None:
        """Records that the learner used a hint."""
        self.hints_used += 1

    def validate(self) -> None:
        """Validates the domain object.

        Raises:
            Exception: If any of the required fields are invalid.
        """
        if not self.exploration_id:
            raise Exception('exploration_id must be specified')
        if not self.state_name:
            raise Exception('state_name must be specified')
        if not self.user_id:
            raise Exception('user_id must be specified')
        if not self.interaction_type:
            raise Exception('interaction_type must be specified')
        if self.attempts < 0:
            raise Exception('attempts must be non-negative')
        if self.hints_used < 0:
            raise Exception('hints_used must be non-negative')


class LearningPathCard:
    """Domain object representing a card in the learning path sequence.

    This wraps an exploration state with additional metadata for
    learning path display and navigation.
    """

    def __init__(
        self,
        state_name: str,
        display_order: int,
        card_title: str,
        card_type: str,
        status: str,
        interaction_id: Optional[str] = None,
    ) -> None:
        """Constructs a LearningPathCard domain object.

        Args:
            state_name: str. The name of the state.
            display_order: int. The sequential position in the learning path.
            card_title: str. Display title for the card.
            card_type: str. Type of card ('checkpoint' or 'standard').
            status: str. Progress status ('completed', 'current', 'upcoming').
            interaction_id: str|None. The ID of the interaction if present.
        """
        self.state_name = state_name
        self.display_order = display_order
        self.card_title = card_title
        self.card_type = card_type
        self.status = status
        self.interaction_id = interaction_id

    def to_dict(self) -> Dict[str, object]:
        """Returns a dictionary representation of this domain object.

        Returns:
            dict. A dictionary with card data.
        """
        return {
            'state_name': self.state_name,
            'display_order': self.display_order,
            'card_title': self.card_title,
            'card_type': self.card_type,
            'status': self.status,
            'interaction_id': self.interaction_id,
        }
