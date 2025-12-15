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

"""Unit tests for card_progress_domain.py."""

from __future__ import annotations

import datetime

from core.domain import card_progress_domain
from core.tests import test_utils


class CardInteractionProgressTests(test_utils.GenericTestBase):
    """Tests for CardInteractionProgress domain object."""

    def setUp(self) -> None:
        super().setUp()
        self.exploration_id = 'exp_id_1'
        self.state_name = 'Introduction'
        self.user_id = 'user_id_1'
        self.interaction_type = 'NumericExpressionInput'

    def test_initialization_with_defaults(self) -> None:
        """Test CardInteractionProgress initialization with default values."""
        progress = card_progress_domain.CardInteractionProgress(
            exploration_id=self.exploration_id,
            state_name=self.state_name,
            user_id=self.user_id,
            interaction_type=self.interaction_type,
        )

        self.assertEqual(progress.exploration_id, self.exploration_id)
        self.assertEqual(progress.state_name, self.state_name)
        self.assertEqual(progress.user_id, self.user_id)
        self.assertEqual(progress.interaction_type, self.interaction_type)
        self.assertEqual(progress.submitted_answers, [])
        self.assertFalse(progress.is_correct)
        self.assertEqual(progress.hints_used, 0)
        self.assertEqual(progress.attempts, 0)
        self.assertIsNone(progress.visited_at)
        self.assertIsNone(progress.completed_at)

    def test_to_dict_returns_correct_structure(self) -> None:
        """Test that to_dict returns correctly formatted dictionary."""
        visited_time = datetime.datetime(2024, 1, 1, 12, 0, 0)
        progress = card_progress_domain.CardInteractionProgress(
            exploration_id=self.exploration_id,
            state_name=self.state_name,
            user_id=self.user_id,
            interaction_type=self.interaction_type,
            submitted_answers=['2+2'],
            attempts=1,
            hints_used=0,
            visited_at=visited_time,
        )

        progress_dict = progress.to_dict()

        self.assertEqual(progress_dict['state_name'], self.state_name)
        self.assertTrue(progress_dict['visited'])
        self.assertFalse(progress_dict['completed'])
        self.assertEqual(progress_dict['attempts'], 1)
        self.assertEqual(progress_dict['hints_used'], 0)
        self.assertEqual(progress_dict['last_answer'], '2+2')
        self.assertEqual(
            progress_dict['last_visited_at'], visited_time.isoformat()
        )

    def test_record_answer_submission_updates_state(self) -> None:
        """Test that recording answer updates attempts and answers list."""
        progress = card_progress_domain.CardInteractionProgress(
            exploration_id=self.exploration_id,
            state_name=self.state_name,
            user_id=self.user_id,
            interaction_type=self.interaction_type,
        )

        progress.record_answer_submission('2+2', is_correct=False)

        self.assertEqual(len(progress.submitted_answers), 1)
        self.assertEqual(progress.submitted_answers[0], '2+2')
        self.assertEqual(progress.attempts, 1)
        self.assertFalse(progress.is_correct)
        self.assertIsNone(progress.completed_at)

    def test_record_correct_answer_sets_completed(self) -> None:
        """Test that correct answer sets is_correct and completed_at."""
        progress = card_progress_domain.CardInteractionProgress(
            exploration_id=self.exploration_id,
            state_name=self.state_name,
            user_id=self.user_id,
            interaction_type=self.interaction_type,
        )

        progress.record_answer_submission('4', is_correct=True)

        self.assertTrue(progress.is_correct)
        self.assertIsNotNone(progress.completed_at)

    def test_use_hint_increments_counter(self) -> None:
        """Test that use_hint increments the hints_used counter."""
        progress = card_progress_domain.CardInteractionProgress(
            exploration_id=self.exploration_id,
            state_name=self.state_name,
            user_id=self.user_id,
            interaction_type=self.interaction_type,
        )

        progress.use_hint()
        self.assertEqual(progress.hints_used, 1)

        progress.use_hint()
        self.assertEqual(progress.hints_used, 2)

    def test_validate_raises_error_for_missing_exploration_id(self) -> None:
        """Test validation fails when exploration_id is missing."""
        progress = card_progress_domain.CardInteractionProgress(
            exploration_id='',
            state_name=self.state_name,
            user_id=self.user_id,
            interaction_type=self.interaction_type,
        )

        with self.assertRaisesRegex(
            Exception, 'exploration_id must be specified'
        ):
            progress.validate()

    def test_validate_raises_error_for_negative_attempts(self) -> None:
        """Test validation fails when attempts is negative."""
        progress = card_progress_domain.CardInteractionProgress(
            exploration_id=self.exploration_id,
            state_name=self.state_name,
            user_id=self.user_id,
            interaction_type=self.interaction_type,
            attempts=-1,
        )

        with self.assertRaisesRegex(Exception, 'attempts must be non-negative'):
            progress.validate()


class LearningPathCardTests(test_utils.GenericTestBase):
    """Tests for LearningPathCard domain object."""

    def test_initialization_sets_all_properties(self) -> None:
        """Test that initialization sets all properties correctly."""
        card = card_progress_domain.LearningPathCard(
            state_name='Introduction',
            display_order=1,
            card_title='Introduction',
            card_type='checkpoint',
            status='completed',
            interaction_id='TextInput',
        )

        self.assertEqual(card.state_name, 'Introduction')
        self.assertEqual(card.display_order, 1)
        self.assertEqual(card.card_title, 'Introduction')
        self.assertEqual(card.card_type, 'checkpoint')
        self.assertEqual(card.status, 'completed')
        self.assertEqual(card.interaction_id, 'TextInput')

    def test_to_dict_returns_correct_structure(self) -> None:
        """Test that to_dict returns correctly formatted dictionary."""
        card = card_progress_domain.LearningPathCard(
            state_name='Main Concept',
            display_order=2,
            card_title='Main Concept',
            card_type='standard',
            status='current',
            interaction_id='NumericExpressionInput',
        )

        card_dict = card.to_dict()

        self.assertEqual(card_dict['state_name'], 'Main Concept')
        self.assertEqual(card_dict['display_order'], 2)
        self.assertEqual(card_dict['card_title'], 'Main Concept')
        self.assertEqual(card_dict['card_type'], 'standard')
        self.assertEqual(card_dict['status'], 'current')
        self.assertEqual(card_dict['interaction_id'], 'NumericExpressionInput')
